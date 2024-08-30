import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "./types.js";

/**
 * @group Cache
 */
export namespace Cache {
	/**
	 * A string representing a key in the cache.
	 */
	export type Key = string;
	/**
	 * A number representing the time-to-live for the cache.
	 */
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
 * @group Cache
 */
export class Cache {
	protected prefix = "cache";
	protected separator = ":";

	constructor(
		protected kv: KVNamespace,
		protected waitUntil: WaitUntilFunction,
	) {}

	/**
	 * A read-only property that gives you the `KVNamespace` used by the Cache object.
	 *
	 * The namespace can be used to access the KVNamespace directly in case you need to integrate with it.
	 * @example
	 * let namespace = cache().binding;
	 */
	get binding() {
		return this.kv;
	}

	/**
	 * The `cache().fetch` method is used to get a value from the cache or
	 * calculate it if it's not there.
	 *
	 * The function expects the key, the TTL, and a function that will be called
	 * to calculate the value if it's not in the cache.
	 * @param key The cache key to use, always prefixed by `cache:`
	 * @param ttl The time-to-live for the cache, in seconds
	 * @param callback The function to call if the cache is not found
	 *
	 * @example
	 * let ONE_HOUR_IN_SECONDS = 3600;
	 *
	 * let value = await cache().fetch("key", ONE_HOUR_IN_SECONDS, async () => {
	 *   // do something expensive and return the value
	 * });
	 *
	 * @description The TTL is optional, it defaults to 60 seconds if not provided.
	 *
	 * @example
	 * await cache().fetch("another-key", async () => {
	 *   // The TTL is optional, it defaults to 60 seconds
	 * });
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
	 * The `cache().purge` method is used to remove a key from the cache.
	 * @param key The cache key to delete, always prefixed by `cache:`
	 *
	 * @example
	 * cache().purge("key");
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
