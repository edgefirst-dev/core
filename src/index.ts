import { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import { AI } from "./lib/ai.js";
import { Cache } from "./lib/cache.js";
import { DB } from "./lib/db.js";
import { Env } from "./lib/env.js";
import {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
} from "./lib/errors.js";
import { FS } from "./lib/fs.js";
import { Geo } from "./lib/geo.js";
import { KV } from "./lib/kv.js";
import { Queue } from "./lib/queue.js";
import { type Session, WorkerKVSessionStorage } from "./lib/session.js";
import { type EdgeFirstContext, storage } from "./lib/storage.js";
import type {
	Bindings,
	SessionData,
	SessionFlashData,
	DatabaseSchema,
} from "./lib/types.js";

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

/** @internal */
function internal_store(key: keyof EdgeFirstContext) {
	let store = storage.getStore();
	if (!store) throw new EdgeContextError(key);
	return store;
}

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export function fs() {
	return internal_store("fs").fs;
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
	return internal_store("cache").cache;
}

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export function db() {
	return internal_store("db").db;
}

/**
 * Get a Drizzle ORM instance for your Edge-first application already connected
 * to your D1 database.
 */
export function orm() {
	return internal_store("orm").orm;
}

/**
 * The `env` function gives you access to the environment variables in a
 * type-safe way.
 */
export function env() {
	return internal_store("env").env;
}

/**
 * Add a global, low-latency key-value data storage to your Edge-first
 * application.
 */
export function kv() {
	return internal_store("kv").kv;
}

/**
 * Access the request object in your Edge-first application.
 */
export function request() {
	return internal_store("request").request;
}

/**
 * Access the AbortSignal associated with the request in your Edge-first
 * application.
 */
export function signal() {
	return internal_store("signal").signal;
}

/**
 * Access the headers of the request in your Edge-first application.
 */
export function headers() {
	return internal_store("headers").headers;
}

/**
 * Run machine learning models, such as LLMs in your Edge-first application.
 */
export function unstable_ai() {
	return internal_store("ai").ai;
}

/**
 * Access the geolocation information of the request in your Edge-first
 * application.
 */
export function unstable_geo() {
	return internal_store("geo").geo;
}

/**
 * Enqueue for processing later any kind of payload of data.
 */
export function unstable_queue() {
	return internal_store("queue").queue;
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
 * import { experimental_rateLimit } from "@edgefirst-dev/core";
 *
 * @example
 * let rateLimit = experimental_rateLimit();
 *
 * @example
 * let rateLimit = experimental_rateLimit({ limit: 10, period: 60 });
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
export function experimental_rateLimit() {
	return internal_store("rateLimit").rateLimit;
}

/**
 * Get access to the session storage for your Edge-first application.
 */
export function experimental_sessionStorage() {
	return internal_store("sessionStorage").sessionStorage;
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings, SessionData, SessionFlashData, DatabaseSchema };
