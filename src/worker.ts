import type {
	ExportedHandler,
	Message,
	MessageBatch,
	Request,
	Response,
	ScheduledController,
} from "@cloudflare/workers-types";
import type { Data } from "@edgefirst-dev/data";
import type { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import type { Logger } from "drizzle-orm";
import type { Job } from "./lib/jobs/job.js";
import { JobsManager } from "./lib/jobs/manager.js";
import { storage } from "./lib/storage/storage.js";
import { TaskManager } from "./lib/tasks/manager.js";
import type { Task } from "./lib/tasks/task.js";
import type { Bindings, DatabaseSchema } from "./lib/types.js";

export function bootstrap(
	options: bootstrap.Options,
): ExportedHandler<Bindings> {
	return {
		async fetch(request, bindings, ctx) {
			return storage.setup({ request, bindings, ctx, options }, () => {
				return options.onRequest(request, bindings, ctx);
			});
		},

		scheduled(event, bindings, ctx) {
			return storage.setup({ bindings, ctx, options }, () => {
				if (options.onSchedule) {
					return options.onSchedule(event, bindings, ctx);
				}

				let manager = new TaskManager(options.tasks?.() ?? []);
				manager.process(event);
			});
		},

		queue(batch, bindings, ctx) {
			return storage.setup({ bindings, ctx, options }, () => {
				if (options.onQueue) return options.onQueue(batch, bindings, ctx);

				let manager = new JobsManager(options.jobs?.() ?? []);

				manager.processBatch(batch, (error, message) => {
					console.info(error);
					message.retry();
				});
			});
		},
	};
}

export namespace bootstrap {
	export interface Options {
		/** The options for the ORM. */
		orm?: {
			/** The database schema for the ORM. */
			schema: DatabaseSchema;
			/** The logger for the ORM. */
			logger?: Logger;
		};

		/** The options for the rate limit. */
		rateLimit?: WorkerKVRateLimit.Options;

		/** A function that returns the list of jobs to register */
		jobs?(): Job<Data>[];

		/** A function that returns the list of tasks to register */
		tasks?(): Task[];

		/** A function that will run if a job failed */
		onJobError?(error: unknown, message: Message): void;

		/** A function that will run if a task failed */
		onTaskError?(error: unknown, task: Task): void;

		/** The function that will run every time a new request comes in */
		onRequest(
			request: Request,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<Response>;

		/** The function that will run every time a scheduled task is executed */
		onSchedule?(
			event: ScheduledController,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<void>;

		/** The function that will run every time a queue message is consumed */
		onQueue?(
			batch: MessageBatch,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<void>;
	}
}
