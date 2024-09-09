import { WorkerKVRateLimit } from "@edgefirst-dev/worker-kv-rate-limit";
import Headers from "@mjackson/headers";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
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
import { remember } from "./lib/remember.js";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export type { AI, Cache, DB, Env, FS, Geo, KV, Queue, WorkerKVRateLimit };

const SYMBOLS = {
	ai: Symbol(),
	cache: Symbol(),
	db: Symbol(),
	env: Symbol(),
	fs: Symbol(),
	kv: Symbol(),
	orm: Symbol(),
	queue: Symbol(),
};

/** @internal */
export function internal_store(key: string) {
	let store = storage.getStore();
	if (!store) throw new EdgeContextError(key);
	return store;
}

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export function fs() {
	return remember(SYMBOLS.fs, () => {
		let c = internal_store("fs");
		if ("FS" in c.bindings) return new FS(c.bindings.FS);
		throw new EdgeConfigError("FS");
	});
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
 * @group Cache
 * @example
 * import { cache } from "@edgefirst-dev/core";
 */
export function cache() {
	return remember(SYMBOLS.cache, () => {
		let c = internal_store("cache");
		if ("KV" in c.bindings) return new Cache(c.bindings.KV, c.waitUntil);
		throw new EdgeConfigError("KV");
	});
}

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export function db() {
	return remember(SYMBOLS.db, () => {
		let c = internal_store("db");
		if ("DB" in c.bindings) return new DB(c.bindings.DB);
		throw new EdgeConfigError("DB");
	});
}

/**
 * Get a Drizzle ORM instance for your Edge-first application already connected
 * to your D1 database.
 * @param schema The Drizzle schema of your database
 * @param logger An optional custom logger
 * @example
 * import { orm } from "@edgefirst-dev/core";
 * import * as schema from "~/db/schema";
 * let users = await orm(schema).query.users.findMany()
 */
export function orm<
	Schema extends Record<string, unknown> = Record<string, never>,
>(schema: Schema, logger?: Logger) {
	return remember(SYMBOLS.orm, () => {
		let c = internal_store("db");
		if ("DB" in c.bindings) return drizzle(c.bindings.DB, { schema, logger });
		throw new EdgeConfigError("DB");
	});
}

/**
 * The `env` function gives you access to the environment variables in a
 * type-safe way.
 * @warn
 */
export function env() {
	return remember(SYMBOLS.env, () => {
		let c = internal_store("env");
		return new Env(c.bindings);
	});
}

/**
 * Add a global, low-latency key-value data storage to your Edge-first
 * application.
 */
export function kv() {
	return remember(SYMBOLS.kv, () => {
		let c = internal_store("kv");
		if ("KV" in c.bindings) return new KV(c.bindings.KV);
		throw new EdgeConfigError("KV");
	});
}

/**
 * Access the request object in your Edge-first application.
 */
export function request() {
	let c = internal_store("request");
	return c.request;
}

/**
 * Access the AbortSignal associated with the request in your Edge-first
 * application.
 */
export function signal() {
	let c = internal_store("signal");
	return c.request.signal;
}

/**
 * Access the headers of the request in your Edge-first application.
 * @returns An `@mjackson/headers` object
 */
export function headers() {
	let c = internal_store("headers");
	return new Headers(c.request.headers);
}

/**
 * Run machine learning models, such as LLMs in your Edge-first application.
 */
export function unstable_ai() {
	return remember(SYMBOLS.ai, () => {
		let c = internal_store("ai");
		if ("AI" in c.bindings) return new AI(c.bindings.AI);
		throw new EdgeConfigError("AI");
	});
}

/**
 * Access the geolocation information of the request in your Edge-first
 * application.
 */
export function unstable_geo() {
	let c = internal_store("geo");
	return new Geo(c.request);
}

/**
 * Enqueue for processing later any kind of payload of data.
 */
export function unstable_queue() {
	return remember(SYMBOLS.queue, () => {
		let c = internal_store("queue");
		if ("QUEUE" in c.bindings) return new Queue(c.bindings.QUEUE, c.waitUntil);
		throw new EdgeConfigError("Queue");
	});
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
 * @example
 * let rateLimit = experimental_rateLimit();
 * @example
 * let rateLimit = experimental_rateLimit({ limit: 10, period: 60 });
 * @example
 * let result = await rateLimit.limit({ key });
 * if (result.success) return json(data);
 * return json(error, { status: 429 });
 * @example
 * let headers = await rateLimit.writeHttpMetadata(key);
 * if (!result.success) return json(error, { status: 429, headers });
 * return json(data, { headers });
 * @example
 * await rateLimit.reset(key);
 */
export function experimental_rateLimit(options?: WorkerKVRateLimit.Options) {
	let c = internal_store("rateLimit");
	if ("KV" in c.bindings) return new WorkerKVRateLimit(c.bindings.KV, options);
	throw new EdgeConfigError("RateLimit");
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings };
