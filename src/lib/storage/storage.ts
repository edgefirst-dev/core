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
	DatabaseSchema,
	Environment,
	PassThroughOnExceptionFunction,
	WaitUntilFunction,
} from "../types.js";

export interface EdgeFirstContext {
	ai?: AI;
	bindings: Environment;
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
		{ request, env, ctx, options }: Storage.SetupOptions,
		callback: () => T,
	) {
		let waitUntil = ctx.waitUntil.bind(ctx);
		let passThroughOnException = ctx.passThroughOnException.bind(ctx);

		return this.run<T>(
			{
				ai: env.AI && new AI(env.AI),
				bindings: env,
				cache: env.KV && new Cache(env.KV, waitUntil),
				env: new Env(env),
				fs: env.FS && new FS(env.FS),
				geo: request && new Geo(request),
				headers: request && new SuperHeaders(request.headers),
				kv: env.KV && new KV(env.KV),
				options,
				orm: env.DB && options?.orm && drizzle(env.DB, options.orm),
				passThroughOnException,
				queue: env.QUEUE && new Queue(env.QUEUE, waitUntil),
				rateLimit:
					env.KV &&
					new WorkerKVRateLimit(
						env.KV,
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
		env: Environment;
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
