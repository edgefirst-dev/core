import type {
	ExportedHandler,
	MessageBatch,
	Request,
	Response,
	ScheduledController,
} from "@cloudflare/workers-types";
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
import { KV } from "./lib/kv.js";
import { Queue } from "./lib/queue.js";
import { WorkerKVSessionStorage } from "./lib/session.js";
import { storage } from "./lib/storage.js";
import type { Bindings, DatabaseSchema } from "./lib/types.js";

export function bootstrap(
	options: bootstrap.Options,
	handlers: bootstrap.Handlers,
): ExportedHandler<Bindings> {
	return {
		async fetch(request, bindings, ctx) {
			// Try to fetch from the ASSETS first, if it exists in the bindings
			if (bindings.ASSETS) {
				let response = await bindings.ASSETS.fetch(request);
				if (response.ok) return response; // Return the response if it's ok
			}

			let waitUntil = ctx.waitUntil.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let sessionStorage = bindings.KV
				? new WorkerKVSessionStorage(bindings.KV)
				: undefined;
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
					sessionStorage,
				},
				() => handlers.onRequest(request, bindings, ctx),
			);
		},

		scheduled(event, bindings, ctx) {
			if (!handlers.onSchedule) {
				throw new Error(
					"To use scheduled events, you must provide an onSchedule handler when bootstrapping your application.",
				);
			}

			let waitUntil = ctx.waitUntil.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let sessionStorage = bindings.KV
				? new WorkerKVSessionStorage(bindings.KV)
				: undefined;
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
					sessionStorage,
				},
				() => handlers.onSchedule?.(event, bindings, ctx),
			);
		},

		queue(batch: MessageBatch, bindings, ctx) {
			if (!handlers.onQueue) {
				throw new Error(
					"To use queue consumers, you must provide an onQueue handler when bootstrapping your application.",
				);
			}

			let waitUntil = ctx.waitUntil.bind(ctx);

			let cache = bindings.KV ? new Cache(bindings.KV, waitUntil) : undefined;
			let db = bindings.DB ? new DB(bindings.DB) : undefined;
			let env = new Env(bindings);
			let sessionStorage = bindings.KV
				? new WorkerKVSessionStorage(bindings.KV)
				: undefined;
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
					sessionStorage,
				},
				() => handlers.onQueue?.(batch, bindings, ctx),
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
	}

	export interface Handlers {
		onRequest(
			request: Request,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<Response>;

		onSchedule?(
			event: ScheduledController,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<void>;

		onQueue?(
			batch: MessageBatch,
			bindings: Bindings,
			ctx: ExecutionContext,
		): Promise<void>;
	}
}
