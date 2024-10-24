import { AsyncLocalStorage } from "node:async_hooks";
import type { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import type SuperHeaders from "@mjackson/headers";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { AI } from "./ai.js";
import type { Cache } from "./cache.js";
import type { DB } from "./db.js";
import type { Env } from "./env.js";
import { EdgeContextError } from "./errors.js";
import type { FS } from "./fs.js";
import type { Geo } from "./geo.js";
import type { KV } from "./kv.js";
import type { Queue } from "./queue.js";
import type {
	Bindings,
	DatabaseSchema,
	PassThroughOnExceptionFunction,
	WaitUntilFunction,
} from "./types.js";

export interface EdgeFirstContext {
	ai?: AI;
	db?: DB;
	fs?: FS;
	kv?: KV;
	env: Env;
	geo?: Geo;
	orm?: DrizzleD1Database<DatabaseSchema>;
	cache?: Cache;
	queue?: Queue;
	signal?: AbortSignal;
	headers?: SuperHeaders;
	request?: Request;
	bindings?: Bindings;
	rateLimit?: WorkerKVRateLimit;
	waitUntil: WaitUntilFunction;
	passThroughOnException: PassThroughOnExceptionFunction;
}

export const storage = new AsyncLocalStorage<EdgeFirstContext>();

export function store<K extends keyof EdgeFirstContext>(
	key: K,
): NonNullable<EdgeFirstContext[K]> {
	let store = storage.getStore();
	if (!store) throw new EdgeContextError(key);
	let value = store[key];
	if (!value) throw new EdgeContextError(key);
	return value;
}
