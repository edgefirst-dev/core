import type { KVNamespace } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";

export namespace KV {
	export interface Key {
		name: string;
		meta: unknown;
		ttl?: number;
	}

	export namespace Keys {
		export interface Options {
			limit?: number;
			cursor?: string;
		}

		export type Output =
			| { items: Array<Key>; meta: { cursor: null; done: true } }
			| { items: Array<Key>; meta: { cursor: string; done: false } };
	}

	export namespace Get {
		export type Type = "text" | "json" | "arrayBuffer" | "stream";

		export interface Output<T, M = unknown> {
			data: T | null;
			meta: M;
		}
	}

	export namespace Set {
		export interface Options<T> {
			ttl?: number;
			metadata?: T;
		}
	}
}

export class KV {
	constructor(protected kv: KVNamespace) {}

	async keys(
		prefix?: string,
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

	async get<T, M = unknown>(key: string): Promise<KV.Get.Output<T, M>> {
		let result = await this.kv.getWithMetadata<T>(key, "json");
		return { data: result.value, meta: result.metadata as M };
	}

	async set<T extends Jsonifiable, M = unknown>(
		key: string,
		value: T,
		options?: KV.Set.Options<M>,
	) {
		this.kv.put(key, JSON.stringify(value), {
			expirationTtl: options?.ttl,
			metadata: options?.metadata,
		});
	}

	async has(key: string): Promise<boolean> {
		let result = await this.get(key);
		if (result.data === null) return false;
		return true;
	}

	del(key: string) {
		return this.kv.delete(key);
	}
}
