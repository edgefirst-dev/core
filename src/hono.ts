/**
 * The [Hono](https://hono.dev) middleware setups the Edge-first runtime for
 * the rest of your Remix application.
 *
 * Without this middleware using any of the functions provided from
 * `@edgefirst-dev/core` will result in an error being thrown.
 *
 * @module hono
 */
import { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import SuperHeaders from "@mjackson/headers";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
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

export namespace edgeRuntime {
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
}

/**
 * Creates an Edge-first Runtime middleware for Hono. Any request after this
 * will have access to the Edge environment.
 *
 * @params options - The options for the middleware.
 *
 * @params options.orm - The options for the ORM.
 * @params options.orm.schema - The database schema for the ORM.
 * @params options.orm.logger - The logger for the ORM.
 *
 * @params options.rateLimit - The options for the rate limit.
 * @params options.rateLimit.limit - The limit for the rate limit.
 * @params options.rateLimit.period - The period for the rate limit.
 *
 * @returns A Hono middleware that provides access to the Edge environment.
 *
 * @example
 * app.use(
 *   edgeRuntime({
 *     orm: { schema },
 *     rateLimit: { limit: 100, period: 60 }
 *   })
 * );
 *
 * app.get("/", async () => {
 *   let data = await kv().get("key");
 *   // more code
 * });
 *
 * @example
 * app.use(edgeRuntime({ orm:  { schema } }));
 */
export function edgeRuntime(options: edgeRuntime.Options) {
	return createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
		let request = c.req.raw;
		let bindings = c.env;
		let waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);

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
			bindings.DB && options.orm
				? drizzle(bindings.DB, options.orm)
				: undefined;
		let rateLimit = bindings.KV
			? new WorkerKVRateLimit(
					bindings.KV,
					options.rateLimit ?? { limit: 100, period: 60 },
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
				request,
				bindings,
				rateLimit,
				waitUntil,
				sessionStorage,
			},
			next,
		);
	});
}
