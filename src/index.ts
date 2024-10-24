import type { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import type { AI } from "./lib/ai.js";
import type { Cache } from "./lib/cache.js";
import type { DB } from "./lib/db.js";
import type { Env } from "./lib/env.js";
import {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
} from "./lib/errors.js";
import type { FS } from "./lib/fs.js";
import type { Geo } from "./lib/geo.js";
import type { KV } from "./lib/kv.js";
import type { Queue } from "./lib/queue.js";
import { type Session, WorkerKVSessionStorage } from "./lib/session.js";
import { store } from "./lib/storage.js";
import type {
	Bindings,
	DatabaseSchema,
	SessionData,
	SessionFlashData,
} from "./lib/types.js";

// biome-ignore lint/performance/noBarrelFile: This is ok
export { Job } from "./lib/job.js";
export { JobsManager } from "./lib/jobs-manager.js";

export type {
	AI,
	Cache,
	DB,
	Env,
	FS,
	Geo,
	KV,
	Queue,
	WorkerKVRateLimit,
	WorkerKVSessionStorage,
	Session,
};

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export function fs() {
	return store("fs");
}

/**
 * The `cache` function gives you access to a cache object powered by
 * Cloudflare Worker KV.
 *
 * Every cached key will be prefixed by `cache:` to avoid conflicts with other
 * keys.
 *
 * This function is memoized so the next time you call it, it will return the
 * same instance of the cache object.
 */
export function cache() {
	return store("cache");
}

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export function db() {
	return store("db");
}

/**
 * Get a Drizzle ORM instance for your Edge-first application already connected
 * to your D1 database.
 */
export function orm() {
	return store("orm");
}

/**
 * The `env` function gives you access to the environment variables in a
 * type-safe way.
 */
export function env() {
	return store("env");
}

/**
 * Add a global, low-latency key-value data storage to your Edge-first
 * application.
 */
export function kv() {
	return store("kv");
}

/**
 * Access the request object in your Edge-first application.
 */
export function request() {
	return store("request");
}

/**
 * Access the AbortSignal associated with the request in your Edge-first
 * application.
 */
export function signal() {
	return store("signal");
}

/**
 * Access the headers of the request in your Edge-first application.
 */
export function headers() {
	return store("headers");
}

/**
 * Run machine learning models, such as LLMs in your Edge-first application.
 */
export function ai() {
	return store("ai");
}

/**
 * Access the geolocation information of the request in your Edge-first
 * application.
 */
export function geo() {
	return store("geo");
}

/**
 * Enqueue for processing later any kind of payload of data.
 */
export function queue() {
	return store("queue");
}

/**
 * Get access to a rate limiter for your Edge-first application.
 *
 * The RateLimit object gives you an `limit` method you can call with any key
 * to identify the thing you want to rate limit.
 *
 * The default limit is set to 10, the default period is set to 60s, this means
 * by default any call to `limit` will allow 10 calls in a limit of 60s
 *
 * There's also a `reset` method that will delete the rate limit for a given
 * key.
 *
 * The `writeHttpMetadata` method will fill a Headers object with the necessary
 * headers to inform the client about the rate limit. If a Headers object is not
 * provided, a new one will be created and returned.
 *
 * @example
 * import { rateLimit } from "@edgefirst-dev/core";
 *
 * @example
 * let rateLimit = rateLimit();
 *
 * @example
 * let rateLimit = rateLimit({ limit: 10, period: 60 });
 *
 * @example
 * let result = await rateLimit.limit({ key });
 * if (result.success) return json(data);
 * return json(error, { status: 429 });
 *
 * @example
 * let headers = await rateLimit.writeHttpMetadata(key);
 * if (!result.success) return json(error, { status: 429, headers });
 * return json(data, { headers });
 *
 * @example
 * await rateLimit.reset(key);
 */
export function rateLimit() {
	return store("rateLimit");
}

/**
 * Get access to the session storage for your Edge-first application.
 */
export function sessionStorage() {
	return store("sessionStorage");
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings, SessionData, SessionFlashData, DatabaseSchema };
