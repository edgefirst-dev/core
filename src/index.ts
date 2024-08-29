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
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export type { AI, Cache, DB, FS, KV, Queue, Env };

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
	let c = internal_store("fs");
	if ("FS" in c.bindings) return new FS(c.bindings.FS);
	throw new EdgeConfigError("FS");
}

/**
 * Cache functions result in your Edge-first applications.
 */
export function cache() {
	let c = internal_store("cache");
	if ("KV" in c.bindings) return new Cache(c.bindings.KV, c.waitUntil);
	throw new EdgeConfigError("KV");
}

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export function db() {
	let c = internal_store("db");
	if ("DB" in c.bindings) return new DB(c.bindings.DB);
	throw new EdgeConfigError("DB");
}

/**
 * Get a Drizzle ORM instance for your Edge-first application already connected
 * to your D1 database.
 * @param schema The Drizzle schema of your database
 * @param logger An optional custom logger
 */
export function unstable_orm<
	Schema extends Record<string, unknown> = Record<string, never>,
>(schema: Schema, logger?: Logger) {
	let c = internal_store("db");
	if ("DB" in c.bindings) return drizzle(c.bindings.DB, { schema, logger });
	throw new EdgeConfigError("DB");
}

/**
 * Access the environment variables in your Edge-first application.
 */
export function env() {
	return new Env();
}

/**
 * Add a global, low-latency key-value data storage to your Edge-first
 * application.
 */
export function kv() {
	let c = internal_store("kv");
	if ("KV" in c.bindings) return new KV(c.bindings.KV);
	throw new EdgeConfigError("KV");
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
	let c = internal_store("ai");
	if ("AI" in c.bindings) return new AI(c.bindings.AI);
	throw new EdgeConfigError("AI");
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
	let c = internal_store("queue");
	if ("QUEUE" in c.bindings) return new Queue(c.bindings.QUEUE, c.waitUntil);
	throw new EdgeConfigError("Queue");
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings };
