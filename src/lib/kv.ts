import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";

export namespace KV {
	export interface Key {
		/** The name of the key. */
		name: string;
		/** The metadata stored along the key. */
		meta: unknown;
		/** The time-to-live of the key. */
		ttl?: number;
	}

	export namespace Keys {
		export type Prefix = string;

		export interface Options {
			/** The maximum number of keys to return. */
			limit?: number;
			/** The cursor to use when fetching more pages of keys. */
			cursor?: string;
		}

		export namespace Output {
			export type Done = {
				/**
				 * The lsit of keys.
				 */
				items: Array<Key>;
				meta: {
					/**
					 * The cursor to use when fetching more pages of keys.
					 */
					cursor: null;
					/**
					 * Whether there are more keys to fetch
					 */
					done: true;
				};
			};

			export type NotDone = {
				/**
				 * The list of keys.
				 */
				items: Array<Key>;
				meta: {
					/**
					 * The cursor to use when fetching more pages of keys.
					 */
					cursor: string;
					/**
					 * Whether there are more keys to fetch
					 */
					done: false;
				};
			};
		}

		export type Output = Output.Done | Output.NotDone;
	}

	export namespace Get {
		export type Key = string;
		export type Value = Jsonifiable;
		export type Meta = Record<string, string>;

		export interface Output<T, M = unknown> {
			/**
			 * The value stored along the key.
			 * It will be null if the key was not found.
			 */
			data: T | null;
			/**
			 * The metadata stored along the key.
			 */
			meta: M | null;
		}
	}

	export namespace Set {
		export type Key = string;
		export type Value = Jsonifiable;
		export type Meta = Record<string, string>;

		export interface Options<T extends Meta> {
			/**
			 * The time-to-live of the key.
			 */
			ttl?: number;
			/**
			 * Extra metadata to store along the key.
			 */
			metadata?: T;
		}
	}

	export namespace Has {
		export type Key = string;
		export type Output = boolean;
	}

	export namespace Del {
		export type Key = string;
	}
}

/**
 * Add a global, low-latency key-value data storage to your Edge-first
 * application.
 */
export class KV {
	constructor(protected kv: KVNamespace) {}

	/**
	 * Retrieves all keys from the KV storage.
	 * @param prefix The prefix to filter keys by.
	 * @param options The options to use when fetching keys.
	 */
	async keys(
		prefix?: KV.Keys.Prefix,
		options: KV.Keys.Options = {},
	): Promise<KV.Keys.Output> {
		let data = await this.kv.list({ prefix, ...options });
		let items = data.keys.map((key) => {
			return { name: key.name, meta: key.metadata, ttl: key.expiration };
		});

		if (data.list_complete) {
			return { items, meta: { cursor: null, done: true } };
		}

		return { items, meta: { cursor: data.cursor, done: false } };
	}

	/**
	 * Retrieves an item from the Key-Value storage.
	 * @param key The key to retrieve.
	 * @returns The value and metadata of the key.
	 */
	async get<Value extends KV.Get.Value, Meta = KV.Get.Meta>(
		key: KV.Get.Key,
	): Promise<KV.Get.Output<Value, Meta>> {
		let result = await this.kv.getWithMetadata<Value>(key, "json");
		let meta = (result.metadata ?? null) as Meta | null;
		return { data: result.value, meta };
	}

	/**
	 * Puts an item in the storage.
	 * @param key The key to set.
	 * @param value The value to store, it must be serializable to JSON.
	 * @param options The options to use when setting the key.
	 */
	set<Value extends KV.Set.Value, Meta extends KV.Set.Meta>(
		key: KV.Set.Key,
		value: Value,
		options?: KV.Set.Options<Meta>,
	) {
		return this.kv.put(key, JSON.stringify(value), {
			expirationTtl: options?.ttl,
			metadata: options?.metadata,
		});
	}

	/**
	 * Checks if an item exists in the storage.
	 * @param key The key to check.
	 * @returns Whether the key exists or not.
	 */
	async has(key: KV.Has.Key): Promise<KV.Has.Output> {
		let result = await this.get(key);
		if (result.data === null) return false;
		return true;
	}

	/**
	 * Delete an item from the storage.
	 * @param key The key to delete.
	 */
	del(key: KV.Del.Key) {
		return this.kv.delete(key);
	}
}