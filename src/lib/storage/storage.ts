import { AsyncLocalStorage } from "node:async_hooks";
import type { ExecutionContext, Request } from "@cloudflare/workers-types";
import { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import SuperHeaders from "@mjackson/headers";
import type { Logger } from "drizzle-orm";
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { AI } from "../ai/ai.js";
import { Cache } from "../cache/cache.js";
import { Env } from "../env/env.js";
import { EdgeContextError } from "../errors.js";
import { FS } from "../fs/fs.js";
import { Geo } from "../geo/geo.js";
import { KV } from "../kv/kv.js";
import { Queue } from "../queue/queue.js";
import type {
	Bindings,
	DatabaseSchema,
	PassThroughOnExceptionFunction,
	WaitUntilFunction,
} from "../types.js";

export interface EdgeFirstContext {
	ai?: AI;
	bindings: Bindings;
	cache?: Cache;
	env: Env;
	fs?: FS;
	geo?: Geo;
	headers?: SuperHeaders;
	kv?: KV;
	options: Storage.SetupOptions["options"];
	orm?: DrizzleD1Database<DatabaseSchema>;
	passThroughOnException: PassThroughOnExceptionFunction;
	queue?: Queue;
	rateLimit?: WorkerKVRateLimit;
	request?: Request;
	signal?: AbortSignal;
	waitUntil: WaitUntilFunction;
}

class Storage extends AsyncLocalStorage<EdgeFirstContext> {
	setup<T>(
		{ request, bindings, ctx, options }: Storage.SetupOptions,
		callback: () => T,
	) {
		let waitUntil = ctx.waitUntil.bind(ctx);
		let passThroughOnException = ctx.passThroughOnException.bind(ctx);

		return this.run<T>(
			{
				ai: bindings.AI && new AI(bindings.AI),
				bindings,
				cache: bindings.KV && new Cache(bindings.KV, waitUntil),
				env: new Env(bindings),
				fs: bindings.FS && new FS(bindings.FS),
				geo: request && new Geo(request),
				headers: request && new SuperHeaders(request.headers),
				kv: bindings.KV && new KV(bindings.KV),
				options,
				orm: bindings.DB && options?.orm && drizzle(bindings.DB, options.orm),
				passThroughOnException,
				queue: bindings.QUEUE && new Queue(bindings.QUEUE, waitUntil),
				rateLimit:
					bindings.KV &&
					new WorkerKVRateLimit(
						bindings.KV,
						options?.rateLimit ?? { limit: 100, period: 60 },
					),
				waitUntil,
			},
			callback,
		);
	}

	access<K extends keyof EdgeFirstContext>(
		key: K,
	): NonNullable<EdgeFirstContext[K]> {
		let store = this.getStore();
		if (!store) throw new EdgeContextError(key);
		let value = store[key];
		if (!value) throw new EdgeContextError(key);
		return value;
	}
}

export const storage = new Storage();

export namespace Storage {
	export interface SetupOptions {
		bindings: Bindings;
		ctx: ExecutionContext;
		request?: Request;
		options: {
			/** The options for the ORM. */
			orm?: {
				/** The database schema for the ORM. */
				schema: DatabaseSchema;
				/** The logger for the ORM. */
				logger?: Logger;
			};

			/** The options for the rate limit. */
			rateLimit?: WorkerKVRateLimit.Options;
		};
	}
}
