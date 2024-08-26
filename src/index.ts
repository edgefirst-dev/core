import type { Request } from "@cloudflare/workers-types";
import Headers from "@mjackson/headers";
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

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export function fs() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("fs");
	if ("FS" in c.bindings) return new FS(c.bindings.FS);
	throw new EdgeConfigError("FS");
}

/**
 * Cache functions result in your Edge-first applications.
 */
export function cache() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("cache");
	if ("KV" in c.bindings) {
		return new Cache(c.bindings.KV, c.waitUntil);
	}
	throw new EdgeConfigError("KV");
}

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export function db() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("db");
	if ("DB" in c.bindings) return new DB(c.bindings.DB);
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
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("kv");
	if ("KV" in c.bindings) return new KV(c.bindings.KV);
	throw new EdgeConfigError("KV");
}

/**
 * Access the request object in your Edge-first application.
 */
export function request() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("request");
	return c.request;
}

/**
 * Access the AbortSignal associated with the request in your Edge-first
 * application.
 */
export function signal() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("signal");
	return c.request.signal;
}

/**
 * Access the headers of the request in your Edge-first application.
 * @returns An `@mjackson/headers` object
 */
export function headers() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("headers");
	return new Headers(c.request.headers);
}

/**
 * Run machine learning models, such as LLMs in your Edge-first application.
 */
export function unstable_ai() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("ai");
	if ("AI" in c.bindings) return new AI(c.bindings.AI);
	throw new EdgeConfigError("AI");
}

/**
 * Access the geolocation information of the request in your Edge-first
 * application.
 */
export function unstable_geo() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("geo");
	return new Geo(c.request);
}

/**
 * Enqueue for processing later any kind of payload of data.
 */
export function unstable_queue() {
	let c = storage.getStore();
	if (!c) throw new EdgeContextError("queue");
	if ("QUEUE" in c.bindings) {
		return new Queue(c.bindings.QUEUE, c.waitUntil);
	}
	throw new EdgeConfigError("Queue");
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings };
