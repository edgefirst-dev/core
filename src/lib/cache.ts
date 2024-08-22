import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "./types.js";

export namespace Cache {
	export namespace Fetch {
		export type Key = string;

		export type TTL = number;

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
	constructor(
		protected kv: KVNamespace,
		protected waitUntil: WaitUntilFunction,
	) {}

	/**
	 * Fetches a value from the cache, or calls the given function if the cache
	 * is not found. The result of the function is stored in the cache.
	 * @param key The cache key to use, always prefixed by `cache:`
	 * @param ttl The time-to-live for the cache, in seconds
	 * @param callback The function to call if the cache is not found
	 */
	async fetch<T extends Jsonifiable>(
		key: Cache.Fetch.Key,
		cb: Cache.Fetch.CallbackFunction<T>,
	): Promise<T>;
	async fetch<T extends Jsonifiable>(
		key: Cache.Fetch.Key,
		ttl: Cache.Fetch.TTL,
		callback: Cache.Fetch.CallbackFunction<T>,
	): Promise<T>;
	async fetch<T extends Jsonifiable>(
		key: Cache.Fetch.Key,
		ttlOrCb: Cache.Fetch.TTL | Cache.Fetch.CallbackFunction<T>,
		callback?: Cache.Fetch.CallbackFunction<T>,
	): Promise<T> {
		let cacheKey = `cache:${key}`;

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

	private ttl<T>(
		ttlOrCb: Cache.Fetch.TTL | Cache.Fetch.CallbackFunction<T>,
	): number {
		if (typeof ttlOrCb === "number") return ttlOrCb;
		return 60;
	}

	private cb<T>(
		ttlOrCb: Cache.Fetch.TTL | Cache.Fetch.CallbackFunction<T>,
		callback?: Cache.Fetch.CallbackFunction<T>,
	): Cache.Fetch.CallbackFunction<T> {
		let cb: Cache.Fetch.CallbackFunction<T> | null = null;
		if (typeof ttlOrCb === "function") cb = ttlOrCb;
		else if (callback) cb = callback;
		else throw new Error("No callback function provided");
		return cb;
	}
}
