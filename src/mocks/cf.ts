import { mock } from "bun:test";
import type {
	KVNamespace,
	KVNamespaceListOptions,
	KVNamespaceListResult,
	R2ListOptions,
} from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "../lib/types.js";

export function waitUntilFactory() {
	return mock<WaitUntilFunction>().mockImplementation(
		(promise: Promise<unknown>) => void 0,
	);
}

export class MockKVNamespace implements KVNamespace {
	#data: Map<string, { value: Jsonifiable; metadata?: unknown }>;

	constructor(
		initialData?: readonly [
			string,
			{ value: Jsonifiable; metadata?: unknown },
		][],
	) {
		this.#data = new Map<string, { value: Jsonifiable; metadata?: unknown }>(
			initialData,
		);
	}

	get = mock().mockImplementation((key: string) => {
		let value = this.#data.get(key)?.value ?? null;
		return Promise.resolve(value);
	});

	put = mock().mockImplementation(
		(
			key: string,
			value: Jsonifiable,
			options?: { expirationTtl?: number; metadata?: unknown },
		) => {
			return Promise.resolve(
				this.#data.set(key, { value, metadata: options?.metadata }),
			);
		},
	);

	delete = mock().mockImplementation((key: string) => {
		Promise.resolve(this.#data.delete(key));
	});

	list = mock().mockImplementation((options: KVNamespaceListOptions) => {
		let keys = Array.from(this.#data.entries()).map(([key, { metadata }]) => ({
			name: key,
			meta: metadata,
		}));
		let total = keys.length;

		if (options?.prefix) {
			keys = keys.filter((object) =>
				// biome-ignore lint/style/noNonNullAssertion: This is a test
				object.name.startsWith(options.prefix!),
			);
			total = keys.length;
		}

		if (options?.limit) {
			let startAt = Number(options?.cursor ?? 0);
			let endAt = startAt + options.limit;
			keys = keys.slice(startAt, endAt);
		}

		let done = this.getDone(
			total,
			keys.length,
			options?.cursor ?? undefined,
			options?.limit,
		);

		let cursor = this.getCursor(
			done,
			options?.cursor ?? undefined,
			options?.limit,
		);

		return {
			list_complete: done,
			keys,
			cursor,
			cacheStatus: null,
		} as KVNamespaceListResult<unknown>;
	});

	getWithMetadata = mock().mockImplementation((key: string) => {
		let result = this.#data.get(key);
		if (result) return result;
		return { data: null, meta: null };
	});

	private getDone(total: number, length: number, cursor?: string, limit = 10) {
		if (total === length) return true;
		if (cursor) return Number(cursor) + limit >= total;
		return false;
	}

	private getCursor(done: boolean, cursor?: string, limit = 10) {
		if (done) return null;
		if (cursor) return String(Number(cursor) + limit);
		return String(limit);
	}
}

export class MockR2Bucket implements R2Bucket {
	#data: Map<string, R2Object>;

	constructor(initialData?: readonly [string, R2Object][]) {
		this.#data = new Map<string, R2Object>(initialData);
	}

	createMultipartUpload = mock();

	delete = mock().mockImplementation((key: string) => {
		this.#data.delete(key);
		return Promise.resolve();
	});

	get = mock().mockImplementation((key: string) => {
		return Promise.resolve(this.#data.get(key));
	});

	head = mock().mockImplementation((key: string) => {
		return Promise.resolve(this.#data.get(key));
	});

	list = mock().mockImplementation((options?: R2ListOptions) => {
		let objects = Array.from(this.#data.values());
		let total = objects.length;

		if (options?.prefix) {
			objects = objects.filter((object) =>
				// biome-ignore lint/style/noNonNullAssertion: This is a test
				object.key.startsWith(options.prefix!),
			);
			total = objects.length;
		}

		if (options?.limit) {
			let startAt = Number(options?.cursor ?? 0);
			let endAt = startAt + options.limit;
			objects = objects.slice(startAt, endAt);
		}

		let done = this.getDone(
			total,
			objects.length,
			options?.cursor,
			options?.limit,
		);

		let cursor = this.getCursor(done, options?.cursor, options?.limit);

		return Promise.resolve({ objects, truncated: !done, cursor });
	});

	put = mock().mockImplementation((key: string, object: R2Object) => {
		this.#data.set(key, object);
		return Promise.resolve();
	});

	resumeMultipartUpload = mock();

	private getDone(total: number, length: number, cursor?: string, limit = 10) {
		if (total === length) return true;
		if (cursor) return Number(cursor) + limit >= total;
		return false;
	}

	private getCursor(done: boolean, cursor?: string, limit = 10) {
		if (done) return null;
		if (cursor) return String(Number(cursor) + limit);
		return String(limit);
	}
}
