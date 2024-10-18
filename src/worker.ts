import type {
	ExportedHandler,
	ExportedHandlerFetchHandler,
	Request,
	Response,
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

export abstract class Runtime implements ExportedHandler<Bindings> {
	constructor(private options: Runtime.Options) {}

	async fetch(request: Request, bindings: Bindings, ctx: ExecutionContext) {
		return this.#runtime(request, bindings, ctx, this.onRequest.bind(this));
	}

	abstract onRequest(
		request: Request,
		bindings: Bindings,
		ctx: ExecutionContext,
	): Promise<Response>;

	async #runtime(
		request: Request,
		bindings: Bindings,
		ctx: ExecutionContext,
		next: Runtime.Callback,
	) {
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
			bindings.DB && this.options.orm
				? drizzle(bindings.DB, this.options.orm)
				: undefined;
		let rateLimit = bindings.KV
			? new WorkerKVRateLimit(
					bindings.KV,
					this.options.rateLimit ?? { limit: 100, period: 60 },
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
			// @ts-expect-error - This is expected
			() => next(request, bindings, ctx),
		);
	}
}

export namespace Runtime {
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

	export type Callback = ExportedHandlerFetchHandler<Bindings>;
}
