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
		orm: { schema: DatabaseSchema; logger?: Logger };
		rateLimit?: WorkerKVRateLimit.Options;
	}
}

/**
 * Creates an Edge-first Runtime middleware for Hono. Any request after this
 * will have access to the Edge environment.
 * @returns A Hono middleware that provides access to the Edge environment.
 *
 * @example
 * app.use(
 *   edgeRuntime({ orm: { schema }, rateLimit: { limit: 100, period: 60 } })
 * );
 *
 * app.get("/", async () => {
 *   let data = await kv().get("key");
 *   // more code
 * });
 *
 * @example
 * app.use(edgeRuntime({ orm:  { schema } }));
 *
 * app.use(async (c, next) => {
 *   let serverBuild = await importServerBuild();
 *   let handler = remix({
 *     build: serverBuild,
 *     mode: import.meta.env.PROD ? "production" : "development",
 *   });
 *   return handler(c, next);
 * });
 *
 * function importServerBuild(): Promise<ServerBuild> {
 *   if (process.env.NODE_ENV === "development") {
 *     return import("virtual:remix/server-build");
 *   }
 *   return import("../build/server");
 * }
 */
export function edgeRuntime(options: edgeRuntime.Options) {
	return createMiddleware<{ Bindings: Bindings }>((c, next) => {
		let request = c.req.raw;
		let bindings = c.env;
		let waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);

		let cache = new Cache(bindings.KV, waitUntil);
		let db = new DB(bindings.DB);
		let env = new Env(bindings);
		let sessionStorage = new WorkerKVSessionStorage(bindings.KV);
		let fs = new FS(bindings.FS);
		let kv = new KV(bindings.KV);
		let ai = new AI(bindings.AI);
		let geo = new Geo(request);
		let queue = new Queue(bindings.QUEUE, waitUntil);
		let headers = new SuperHeaders(request.headers);
		let orm = drizzle(bindings.DB, options.orm);
		let rateLimit = new WorkerKVRateLimit(
			bindings.KV,
			options.rateLimit ?? { limit: 100, period: 60 },
		);

		return storage.run(
			{
				cache,
				db,
				env,
				sessionStorage,
				fs,
				kv,
				ai,
				geo,
				queue,
				headers,
				orm,
				signal: request.signal,
				rateLimit,
				request,
				bindings,
				waitUntil,
			},
			next,
		);
	});
}
