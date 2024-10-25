import type {
	ExportedHandler,
	MessageBatch,
	Request,
	Response,
	ScheduledController,
} from "@cloudflare/workers-types";
import type { Data } from "@edgefirst-dev/data";
import { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import SuperHeaders from "@mjackson/headers";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { AI } from "./lib/ai.js";
import { Cache } from "./lib/cache.js";
import { DB } from "./lib/db.js";
import { Env } from "./lib/env.js";
import { FS } from "./lib/fs.js";
import { Geo } from "./lib/geo.js";
import type { Job } from "./lib/jobs/job.js";
import { JobsManager } from "./lib/jobs/manager.js";
import { KV } from "./lib/kv.js";
import { Queue } from "./lib/queue.js";
import { storage } from "./lib/storage.js";
import { TaskManager } from "./lib/tasks/manager.js";
import type { Task } from "./lib/tasks/task.js";
import type { Bindings, DatabaseSchema } from "./lib/types.js";

export function bootstrap(
	options: bootstrap.Options,
): ExportedHandler<Bindings> {
	return {
		async fetch(request, bindings, ctx) {
			let waitUntil = ctx.waitUntil.bind(ctx);
			let passThroughOnException = ctx.passThroughOnException.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let fs = bindings.FS ? new FS(bindings.FS) : undefined;
			let kv = bindings.KV ? new KV(bindings.KV) : undefined;
			let ai = bindings.AI ? new AI(bindings.AI) : undefined;
			let geo = new Geo(request);
			let queue = bindings.QUEUE
				? new Queue(bindings.QUEUE, waitUntil)
				: undefined;
			let headers = new SuperHeaders(request.headers);
			let orm =
				bindings.DB && options?.orm
					? drizzle(bindings.DB, options.orm)
					: undefined;
			let rateLimit = bindings.KV
				? new WorkerKVRateLimit(
						bindings.KV,
						options?.rateLimit ?? { limit: 100, period: 60 },
					)
				: undefined;

			return storage.run(
				{
					ai,
					db,
					fs,
					kv,
					env,
					geo,
					orm,
					cache,
					queue,
					signal: request.signal,
					headers,
					// @ts-expect-error - This is expected
					request,
					bindings,
					rateLimit,
					waitUntil,
					passThroughOnException,
				},
				() => options.onRequest(request, bindings, ctx),
			);
		},

		scheduled(event, bindings, ctx) {
			if (!options.tasks && !options.onSchedule) {
				throw new Error(
					"To use scheduled events, you must provide an onSchedule handler when bootstrapping your application or a tasks list.",
				);
			}

			let waitUntil = ctx.waitUntil.bind(ctx);
			let passThroughOnException = ctx.passThroughOnException.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let fs = bindings.FS ? new FS(bindings.FS) : undefined;
			let kv = bindings.KV ? new KV(bindings.KV) : undefined;
			let ai = bindings.AI ? new AI(bindings.AI) : undefined;
			let queue = bindings.QUEUE
				? new Queue(bindings.QUEUE, waitUntil)
				: undefined;
			let orm =
				bindings.DB && options?.orm
					? drizzle(bindings.DB, options.orm)
					: undefined;
			let rateLimit = bindings.KV
				? new WorkerKVRateLimit(
						bindings.KV,
						options?.rateLimit ?? { limit: 100, period: 60 },
					)
				: undefined;

			return storage.run(
				{
					ai,
					db,
					fs,
					kv,
					env,
					orm,
					cache,
					queue,
					bindings,
					rateLimit,
					waitUntil,
					passThroughOnException,
				},
				() => {
					options.onSchedule?.(event, bindings, ctx);

					if (options.onSchedule) {
						return options.onSchedule(event, bindings, ctx);
					}

					let manager = new TaskManager();
					if (options.tasks) {
						for (let task of options.tasks()) manager.schedule(task);
					}
					manager.process(event);
				},
			);
		},

		queue(batch, bindings, ctx) {
			if (!options.jobs && !options.onQueue) {
				throw new Error(
					"To use queue consumers, you must provide an onQueue handler when bootstrapping your application or a jobs list.",
				);
			}

			let waitUntil = ctx.waitUntil.bind(ctx);
			let passThroughOnException = ctx.passThroughOnException.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let fs = bindings.FS ? new FS(bindings.FS) : undefined;
			let kv = bindings.KV ? new KV(bindings.KV) : undefined;
			let ai = bindings.AI ? new AI(bindings.AI) : undefined;
			let queue = bindings.QUEUE
				? new Queue(bindings.QUEUE, waitUntil)
				: undefined;
			let orm =
				bindings.DB && options?.orm
					? drizzle(bindings.DB, options.orm)
					: undefined;
			let rateLimit = bindings.KV
				? new WorkerKVRateLimit(
						bindings.KV,
						options?.rateLimit ?? { limit: 100, period: 60 },
					)
				: undefined;

			return storage.run(
				{
					ai,
					db,
					fs,
					kv,
					env,
					orm,
					cache,
					queue,
					bindings,
					rateLimit,
					waitUntil,
					passThroughOnException,
				},
				() => {
					if (options.onQueue) return options.onQueue(batch, bindings, ctx);
					let manager = new JobsManager();
					if (options.jobs) {
						for (let job of options.jobs()) manager.register(job);
					}
					manager.processBatch(batch, (error, message) => {
						console.log(error);
						message.retry();
					});
				},
			);
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
		tasks?(): Task[];

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
