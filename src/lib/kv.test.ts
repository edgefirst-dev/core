import { describe, expect, test } from "bun:test";

import { MockKVNamespace } from "../mocks/cf.js";
import { KV } from "./kv.js";

describe(KV.name, () => {
	test("#constructor", () => {
		let KVNamespace = new MockKVNamespace();
		let kv = new KV(KVNamespace);
		expect(kv).toBeInstanceOf(KV);
	});

	test("#binding", () => {
		let KVNamespace = new MockKVNamespace();
		let kv = new KV(KVNamespace);
		expect(kv.binding).toBe(KVNamespace);
	});

	test("#keys", async () => {
		let kvNamespace = new MockKVNamespace([
			["key:1", { value: "value" }],
			["key:2", { value: "value2" }],
		]);

		let kv = new KV(kvNamespace);

		expect(kv.keys()).resolves.toEqual({
			keys: [
				{ name: "key:1", meta: undefined, ttl: undefined },
				{ name: "key:2", meta: undefined, ttl: undefined },
			],
			cursor: null,
			done: true,
		});
	});

	test("#keys with prefix", async () => {
		let kvNamespace = new MockKVNamespace([
			["prefix:1", { value: "value" }],
			["key", { value: "value2" }],
		]);

		let kv = new KV(kvNamespace);

		expect(kv.keys("prefix")).resolves.toEqual({
			keys: [{ name: "prefix:1", meta: undefined, ttl: undefined }],
			cursor: null,
			done: true,
		});
	});

	test("#keys paginated", async () => {
		let kvNamespace = new MockKVNamespace([
			["key:1", { value: "value" }],
			["key:2", { value: "value2" }],
		]);

		let kv = new KV(kvNamespace);

		expect(kv.keys({ limit: 1 })).resolves.toEqual({
			keys: [{ name: "key:1", meta: undefined, ttl: undefined }],
			done: false,
			cursor: "1",
		});
	});

	test("#keys with cursor", async () => {
		let kvNamespace = new MockKVNamespace([
			["key:1", { value: "value" }],
			["key:2", { value: "value2" }],
		]);

		let kv = new KV(kvNamespace);

		expect(kv.keys({ cursor: "1", limit: 1 })).resolves.toEqual({
			keys: [{ name: "key:2", meta: undefined, ttl: undefined }],
			done: true,
			cursor: null,
		});
	});

	test("#get", async () => {
		let kvNamespace = new MockKVNamespace([["key", { value: "value" }]]);

		let kv = new KV(kvNamespace);

		expect(kv.get("key")).resolves.toEqual({
			data: "value",
			meta: null,
		});
	});

	test("#get with metadata", async () => {
		let kvNamespace = new MockKVNamespace([
			["key", { value: "value", metadata: { meta: "data" } }],
		]);

		let kv = new KV(kvNamespace);

		expect(kv.get("key")).resolves.toEqual({
			data: "value",
			meta: { meta: "data" },
		});
	});

	test("#set", async () => {
		let kvNamespace = new MockKVNamespace();

		let kv = new KV(kvNamespace);

		await kv.set("key", "value");

		expect(kvNamespace.put).toHaveBeenCalledTimes(1);
		expect(kvNamespace.put).toHaveBeenCalledWith(
			"key",
			JSON.stringify("value"),
			{ expirationTtl: undefined, metadata: undefined },
		);
	});

	test("#set with TTL and metadata", async () => {
		let kvNamespace = new MockKVNamespace();

		let kv = new KV(kvNamespace);

		await kv.set("key", "value", { ttl: 100, metadata: { meta: "data" } });

		expect(kvNamespace.put).toHaveBeenCalledTimes(1);
		expect(kvNamespace.put).toHaveBeenCalledWith(
			"key",
			JSON.stringify("value"),
			{ expirationTtl: 100, metadata: { meta: "data" } },
		);
	});

	test("#has (true)", async () => {
		let kvNamespace = new MockKVNamespace([["key", { value: "value" }]]);

		let kv = new KV(kvNamespace);

		expect(await kv.has("key")).toBeTrue();
		expect(kvNamespace.get).toHaveBeenCalledTimes(1);
	});

	test("#has (false)", async () => {
		let kvNamespace = new MockKVNamespace();

		let kv = new KV(kvNamespace);

		expect(await kv.has("key")).toBeFalse();
		expect(kvNamespace.get).toHaveBeenCalledTimes(1);
	});

	test("#remove", async () => {
		let kvNamespace = new MockKVNamespace([["key", { value: "value" }]]);
		let kv = new KV(kvNamespace);

		await kv.remove("key");

		expect(kvNamespace.delete).toHaveBeenCalledTimes(1);
		expect(kv.has("key")).resolves.toBeFalse();
	});
});
