import { AI } from "./lib/ai.js";
import { Cache } from "./lib/cache.js";
import { DB } from "./lib/db.js";
import { Env } from "./lib/env.js";
import {
	EdgeConfigError,
	EdgeContextError,
	EdgeEnvKeyError,
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
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("kv");
		if ("KV" in context.env) return new KV(context.env.KV);
		throw new EdgeConfigError("KV");
	}

	/**
	 * Upload, store and serve images, videos, music, documents and other
	 * unstructured data in your Edge-first application.
	 */
	export function fs() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("fs");
		if ("FS" in context.env) return new FS(context.env.FS);
		throw new EdgeConfigError("FS");
	}

	/**
	 * Cache functions result in your Edge-first applications.
	 */
	export function cache() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("cache");
		if ("KV" in context.env) {
			return new Cache(context.env.KV, context.ctx.waitUntil.bind(context.ctx));
		}
		throw new EdgeConfigError("KV");
	}

	/**
	 * Access a SQL database in your Edge-first application to store and retrieve
	 * relational data.
	 */
	export function db() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("db");
		if ("DB" in context.env) return new DB(context.env.DB);
		throw new EdgeConfigError("DB");
	}

	/**
	 * Run machine learning models, such as LLMs in your Edge-first application.
	 */
	export function unstable_ai() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("ai");
		if ("AI" in context.env) return new AI(context.env.AI);
		throw new EdgeConfigError("AI");
	}

	/**
	 * Enqueue for processing later any kind of payload of data.
	 */
	export function unstable_queue() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("queue");
		if ("Queue" in context.env) {
			return new Queue(
				context.env.QUEUE,
				context.ctx.waitUntil.bind(context.ctx),
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
}

export { EdgeConfigError, EdgeContextError, EdgeEnvKeyError };

export type { Bindings };
