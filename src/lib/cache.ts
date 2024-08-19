import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";

export namespace Cache {
	export type WaitUntilFunction = (promise: Promise<unknown>) => void;
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

export class Cache {
	constructor(
		protected kv: KVNamespace,
		protected waitUntil: Cache.WaitUntilFunction,
	) {}

	async fetch<T extends Jsonifiable>(
		options: Cache.Fetch.Options,
		cb: Cache.Fetch.CallbackFunction<T>,
	): Promise<T> {
		let cached = await this.kv.get<T>(options.key, "json");
		if (cached) return cached;

		let result = await cb();

		this.waitUntil(
			this.kv.put(options.key, JSON.stringify(result), {
				expirationTtl: options.ttl || 60,
			}),
		);

		return result;
	}
}
