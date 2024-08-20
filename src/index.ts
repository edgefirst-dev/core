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
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("kv");
		if ("KV" in cloudflare.env) return new KV(cloudflare.env.KV);
		throw new EdgeConfigError("KV");
	}

	/**
	 * Upload, store and serve images, videos, music, documents and other
	 * unstructured data in your Edge-first application.
	 */
	export function fs() {
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("fs");
		if ("FS" in cloudflare.env) return new FS(cloudflare.env.FS);
		throw new EdgeConfigError("FS");
	}

	/**
	 * Cache functions result in your Edge-first applications.
	 */
	export function cache() {
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("cache");
		if ("KV" in cloudflare.env) {
			return new Cache(
				cloudflare.env.KV,
				cloudflare.ctx.waitUntil.bind(cloudflare.ctx),
			);
		}
		throw new EdgeConfigError("KV");
	}

	/**
	 * Access a SQL database in your Edge-first application to store and retrieve
	 * relational data.
	 */
	export function db() {
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("db");
		if ("DB" in cloudflare.env) return new DB(cloudflare.env.DB);
		throw new EdgeConfigError("DB");
	}

	/**
	 * Run machine learning models, such as LLMs in your Edge-first application.
	 */
	export function unstable_ai() {
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("ai");
		if ("AI" in cloudflare.env) return new AI(cloudflare.env.AI);
		throw new EdgeConfigError("AI");
	}

	/**
	 * Enqueue for processing later any kind of payload of data.
	 */
	export function unstable_queue() {
		let cloudflare = storage.getStore()?.cloudflare;
		if (!cloudflare) throw new EdgeContextError("queue");
		if ("Queue" in cloudflare.env) {
			return new Queue(
				cloudflare.env.QUEUE,
				cloudflare.ctx.waitUntil.bind(cloudflare.ctx),
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
		let request = storage.getStore()?.request;
		if (!request) throw new EdgeContextError("request");
		return request;
	}

	/**
	 * Access the URL of the request in your Edge-first application.
	 */
	export function url() {
		let request = storage.getStore()?.request;
		if (!request) throw new EdgeContextError("url");
		return new URL(request.url);
	}

	export function headers() {
		let request = storage.getStore()?.request;
		if (!request) throw new EdgeContextError("headers");
		return request.headers;
	}

	export function signal() {
		let request = storage.getStore()?.request;
		if (!request) throw new EdgeContextError("signal");
		return request.signal;
	}

	/**
	 * Access the geolocation information of the request in your Edge-first
	 * application.
	 */
	export function geo() {
		let request = storage.getStore()?.request;
		if (!request) throw new EdgeContextError("geo");
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
