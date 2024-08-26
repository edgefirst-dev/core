import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "./types.js";

export namespace Cache {
	export type Key = string;
	export type TTL = number;

	export namespace Fetch {
		export interface Options {
			/**
			 * The key to use for the cache
			 */
			key: string;
			/**
			 * The time-to-live for the cache
			 */
			ttl?: number;
		}

		export type CallbackFunction<T> = () => T | Promise<T>;
	}
}

/**
 * Cache functions result in your Edge-first applications.
 */
export class Cache {
	protected prefix = "cache";
	protected separator = ":";

	constructor(
		protected kv: KVNamespace,
		protected waitUntil: WaitUntilFunction,
	) {}

	get binding() {
		return this.kv;
	}

	/**
	 * Fetches a value from the cache, or calls the given function if the cache
	 * is not found. The result of the function is stored in the cache.
	 * @param key The cache key to use, always prefixed by `cache:`
	 * @param ttl The time-to-live for the cache, in seconds
	 * @param callback The function to call if the cache is not found
	 */
	async fetch<T extends Jsonifiable>(
		key: Cache.Key,
		cb: Cache.Fetch.CallbackFunction<T>,
	): Promise<T>;
	async fetch<T extends Jsonifiable>(
		key: Cache.Key,
		ttl: Cache.TTL,
		callback: Cache.Fetch.CallbackFunction<T>,
	): Promise<T>;
	async fetch<T extends Jsonifiable>(
		key: Cache.Key,
		ttlOrCb: Cache.TTL | Cache.Fetch.CallbackFunction<T>,
		callback?: Cache.Fetch.CallbackFunction<T>,
	): Promise<T> {
		let cacheKey = this.key(key);

		let cached = await this.kv.get<T>(cacheKey, "json");
		if (cached) return cached;

		let result = await this.cb(ttlOrCb, callback)();

		this.waitUntil(
			this.kv.put(cacheKey, JSON.stringify(result), {
				expirationTtl: this.ttl(ttlOrCb) || 60,
			}),
		);

		return result;
	}

	/**
	 * Delete a specific cache key.
	 * @param key The cache key to delete, always prefixed by `cache:`
	 */
	purge(key: Cache.Key) {
		this.waitUntil(this.kv.delete(this.key(key)));
	}

	protected key(key: Cache.Key): string {
		return [this.prefix, key].join(this.separator);
	}

	private ttl<T>(ttlOrCb: Cache.TTL | Cache.Fetch.CallbackFunction<T>): number {
		if (typeof ttlOrCb === "number") return ttlOrCb;
		return 60;
	}

	private cb<T>(
		ttlOrCb: Cache.TTL | Cache.Fetch.CallbackFunction<T>,
		callback?: Cache.Fetch.CallbackFunction<T>,
	): Cache.Fetch.CallbackFunction<T> {
		let cb: Cache.Fetch.CallbackFunction<T> | null = null;
		if (typeof ttlOrCb === "function") cb = ttlOrCb;
		else if (callback) cb = callback;
		else throw new Error("No callback function provided");
		return cb;
	}
}
