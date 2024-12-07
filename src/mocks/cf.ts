import { mock } from "bun:test";
import type {
	KVNamespace,
	KVNamespaceListOptions,
	KVNamespaceListResult,
	MessageSendRequest,
	Queue,
	QueueSendBatchOptions,
	QueueSendOptions,
	R2ListOptions,
	R2ObjectBody,
} from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";

export class MockKVNamespace implements KVNamespace {
	#data: Map<string, { value: ArrayBuffer; metadata?: unknown }>;

	constructor(
		initialData?: readonly [
			string,
			{ value: Jsonifiable; metadata?: unknown },
		][],
	) {
		if (initialData === undefined) this.#data = new Map();
		else {
			let data = initialData.map(([key, { value, metadata }]) => {
				return [key, { value: this.toArrayBuffer(value), metadata }] as const;
			});
			this.#data = new Map(data);
		}
	}

	get = mock().mockImplementation((key: string, type: "text") => {
		let entry = this.#data.get(key);
		if (!entry) return Promise.resolve(null);

		let { value } = entry;
		let text = new TextDecoder().decode(value);
		return Promise.resolve(text);
	});

	put = mock<KVNamespace["put"]>().mockImplementation((key, value, options) => {
		this.#data.set(key, {
			value:
				typeof value === "string" || typeof value === "object"
					? this.toArrayBuffer(value as Jsonifiable)
					: value,
			metadata: options?.metadata,
		});
		return Promise.resolve();
	});

	delete = mock<KVNamespace["delete"]>().mockImplementation((key: string) => {
		this.#data.delete(key);
		return Promise.resolve();
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

	getWithMetadata = mock().mockImplementation((key: string, type: "json") => {
		let result = this.#data.get(key);
		if (!result) return { data: null, meta: null };
		return Promise.resolve({
			value: JSON.parse(new TextDecoder().decode(result.value)),
			metadata: result.metadata,
		});
	});

	private toArrayBuffer(value: Jsonifiable) {
		let encoded = new TextEncoder().encode(JSON.stringify(value));
		let arrayBuffer = new ArrayBuffer(encoded.length);
		new Uint8Array(arrayBuffer).set(encoded);
		return arrayBuffer;
	}

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
	#data: Map<string, R2ObjectBody>;

	constructor(initialData?: readonly [string, R2ObjectBody][]) {
		this.#data = new Map<string, R2ObjectBody>(initialData);
	}

	createMultipartUpload = mock();

	delete = mock<R2Bucket["delete"]>().mockImplementation((key) => {
		if (Array.isArray(key)) {
			for (let k of key) {
				this.#data.delete(k);
			}
		} else this.#data.delete(key);
		return Promise.resolve();
	});

	get = mock<R2Bucket["get"]>().mockImplementation((key) => {
		return Promise.resolve(this.#data.get(key) ?? null);
	});

	head = mock<R2Bucket["head"]>().mockImplementation((key) => {
		return Promise.resolve(this.#data.get(key) ?? null);
	});

	list = mock<R2Bucket["list"]>().mockImplementation((options) => {
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

		if (done) {
			return Promise.resolve({
				objects,
				truncated: false,
				cursor: null,
				delimitedPrefixes: [],
			});
		}

		let cursor = this.getCursor(options?.cursor, options?.limit);

		return Promise.resolve({
			objects,
			truncated: true,
			cursor,
			delimitedPrefixes: [],
		});
	});

	put = mock<R2Bucket["put"]>().mockImplementation((key, value, options) => {
		let objectBody: R2ObjectBody = {
			key,
			size: this.getSize(value),
			etag: "mock-etag",
			httpMetadata: options?.httpMetadata as R2HTTPMetadata | undefined,
			customMetadata: options?.customMetadata,
			uploaded: new Date(),
			version: "mock-version",
			httpEtag: "mock-httpEtag",
			checksums: {
				toJSON: () => ({}),
			},
			storageClass: "mock-storageClass",
			writeHttpMetadata: () => void 0,
			body: new ReadableStream(),
			bodyUsed: false,
			arrayBuffer() {
				throw new Error("Method not implemented.");
			},
			text(): Promise<string> {
				throw new Error("Function not implemented.");
			},
			json<T>(): Promise<T> {
				throw new Error("Function not implemented.");
			},
			blob(): Promise<Blob> {
				throw new Error("Function not implemented.");
			},
		};

		this.#data.set(key, objectBody);

		return Promise.resolve(objectBody);
	});

	resumeMultipartUpload = mock<
		R2Bucket["resumeMultipartUpload"]
	>().mockImplementation((key, uploadId) => {
		return {
			key,
			uploadId,
			abort: () => Promise.resolve(),
			complete: () =>
				Promise.resolve({
					key,
					size: 0,
					etag: "mock-etag",
					httpMetadata: undefined,
					customMetadata: {},
					uploaded: new Date(),
					version: "mock-version",
					httpEtag: "mock-httpEtag",
					checksums: {
						toJSON: () => ({}),
					},
					storageClass: "mock-storageClass",
					writeHttpMetadata: () => void 0,
					body: new ReadableStream(),
					bodyUsed: false,
					arrayBuffer() {
						throw new Error("Method not implemented.");
					},
					text(): Promise<string> {
						throw new Error("Function not implemented.");
					},
					json<T>(): Promise<T> {
						throw new Error("Function not implemented.");
					},
					blob(): Promise<Blob> {
						throw new Error("Function not implemented.");
					},
				}),
			uploadPart: () =>
				Promise.resolve({
					partNumber: 1,
					etag: "mock-etag",
				}),
		};
	});

	private getDone(total: number, length: number, cursor?: string, limit = 10) {
		if (total === length) return true;
		if (cursor) return Number(cursor) + limit >= total;
		return false;
	}

	private getCursor(cursor?: string, limit = 10) {
		if (cursor) return String(Number(cursor) + limit);
		return String(limit);
	}

	private getSize(
		value:
			| string
			| ReadableStream<unknown>
			| ArrayBufferView
			| ArrayBuffer
			| Blob
			| null,
	) {
		if (typeof value === "string") return value.length;
		if (value instanceof ArrayBuffer) return value.byteLength;
		if (ArrayBuffer.isView(value)) return value.byteLength;
		if (value instanceof Blob) return value.size;
		return 0;
	}
}

export class MockQueue implements Queue {
	send = mock<Queue["send"]>().mockImplementation(
		(message: unknown, options?: QueueSendOptions) => {
			throw new Error("Method not implemented.");
		},
	);

	sendBatch = mock<Queue["sendBatch"]>().mockImplementation(
		(
			messages: Iterable<MessageSendRequest<unknown>>,
			options?: QueueSendBatchOptions,
		) => {
			throw new Error("Method not implemented.");
		},
	);
}
