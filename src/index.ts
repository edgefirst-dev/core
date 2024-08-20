import type { Request } from "@cloudflare/workers-types";
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
import { KV } from "./lib/kv.js";
import { Queue } from "./lib/queue.js";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export type { AI, Cache, DB, FS, KV, Queue, Env };

/**
 * The Edge namespace provides access to the various services available in the
 * Edge-first Stack.
 */
export namespace Edge {
	/**
	 * Add a global, low-latency key-value data storage to your Edge-first
	 * application.
	 */
	export function kv() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("kv");
		if ("KV" in c.env) return new KV(c.env.KV);
		throw new EdgeConfigError("KV");
	}

	/**
	 * Upload, store and serve images, videos, music, documents and other
	 * unstructured data in your Edge-first application.
	 */
	export function fs() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("fs");
		if ("FS" in c.env) return new FS(c.env.FS);
		throw new EdgeConfigError("FS");
	}

	/**
	 * Cache functions result in your Edge-first applications.
	 */
	export function cache() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("cache");
		if ("KV" in c.env) {
			return new Cache(c.env.KV, c.executionCtx.waitUntil.bind(c.executionCtx));
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
		if ("DB" in c.env) return new DB(c.env.DB);
		throw new EdgeConfigError("DB");
	}

	/**
	 * Run machine learning models, such as LLMs in your Edge-first application.
	 */
	export function unstable_ai() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("ai");
		if ("AI" in c.env) return new AI(c.env.AI);
		throw new EdgeConfigError("AI");
	}

	/**
	 * Enqueue for processing later any kind of payload of data.
	 */
	export function unstable_queue() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("queue");
		if ("QUEUE" in c.env) {
			return new Queue(
				c.env.QUEUE,
				c.executionCtx.waitUntil.bind(c.executionCtx),
			);
		}
		throw new EdgeConfigError("Queue");
	}

	/**
	 * Access the environment variables in your Edge-first application.
	 */
	export function env() {
		return new Env();
	}

	/**
	 * Access the request object in your Edge-first application.
	 */
	export function request() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("request");
		return c.req.raw;
	}

	export function signal() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("signal");
		return c.req.raw.signal;
	}

	/**
	 * Access the geolocation information of the request in your Edge-first
	 * application.
	 */
	export function unstable_geo() {
		let c = storage.getStore();
		if (!c) throw new EdgeContextError("geo");
		let request = c.req as unknown as Request;
		if (!request.cf) throw new EdgeRequestGeoError();
		return {
			country: request.cf.country,
			region: request.cf.region,
			city: request.cf.city,
			postalCode: request.cf.postalCode,
			latitude: request.cf.latitude,
			longitude: request.cf.longitude,
			timezone: request.cf.timezone,
			metroCode: request.cf.metroCode,
			continent: request.cf.continent,
			isEurope: request.cf.isEUCountry === "1",
		};
	}
}

export {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
	EdgeRequestGeoError,
};

export type { Bindings };
