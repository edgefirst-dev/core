import { mock } from "bun:test";
import type { KVNamespace, R2ListOptions } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "../lib/types.js";

export function waitUntilFactory() {
	return mock<WaitUntilFunction>().mockImplementation(
		(promise: Promise<unknown>) => void 0,
	);
}

export class MockKVNamespace implements KVNamespace {
	#data: Map<string, Jsonifiable>;

	constructor(initialData?: readonly [string, Jsonifiable][]) {
		this.#data = new Map<string, Jsonifiable>(initialData);
	}

	get = mock().mockImplementation((key: string) => this.#data.get(key));

	put = mock().mockImplementation((key: string, value: Jsonifiable) =>
		Promise.resolve(this.#data.set(key, value)),
	);

	delete = mock().mockImplementation((key: string) => {
		Promise.resolve(this.#data.delete(key));
	});

	list = mock();

	getWithMetadata = mock();
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
