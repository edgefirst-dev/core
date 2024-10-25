import { describe, expect, mock, test } from "bun:test";
import { MockKVNamespace, waitUntilFactory } from "../../mocks/cf.js";
import { Cache } from "./cache.js";

describe(Cache.name, () => {
	test("#constructor", () => {
		let kv = new MockKVNamespace();
		let waitUntil = waitUntilFactory();

		let cache = new Cache(kv, waitUntil);

		expect(cache).toBeInstanceOf(Cache);
	});

	test("#binding", () => {
		let kv = new MockKVNamespace();
		let waitUntil = waitUntilFactory();

		let cache = new Cache(kv, waitUntil);

		expect(cache.binding).toEqual(kv);
	});

	test("#fetch", async () => {
		let kv = new MockKVNamespace();
		let waitUntil = waitUntilFactory();
		let cacheFn = mock().mockImplementation(() => "result");

		let cache = new Cache(kv, waitUntil);
		let result = await cache.fetch("key", cacheFn);

		expect(result).toBe("result");
		expect(kv.get).toHaveBeenCalledTimes(1);
		expect(kv.put).toHaveBeenCalledTimes(1);
		expect(cacheFn).toHaveBeenCalledTimes(1);
		expect(waitUntil).toHaveBeenCalledTimes(1);
	});

	test("#fetch (cached)", async () => {
		let kv = new MockKVNamespace([["cache:key", { value: "result" }]]);
		let waitUntil = waitUntilFactory();
		let cacheFn = mock().mockImplementation(() => "result");

		let cache = new Cache(kv, waitUntil);

		let result = await cache.fetch("key", cacheFn);

		expect(result).toBe("result");
		expect(kv.get).toHaveBeenCalledTimes(1);
		// None of these should be called because data comes from cache
		expect(kv.put).toHaveBeenCalledTimes(0);
		expect(cacheFn).toHaveBeenCalledTimes(0);
		expect(waitUntil).toHaveBeenCalledTimes(0);
	});

	test("#fetch with TTL", async () => {
		let kv = new MockKVNamespace();
		let waitUntil = waitUntilFactory();
		let cacheFn = mock().mockImplementation(() => "result");

		let cache = new Cache(kv, waitUntil);
		let result = await cache.fetch("key", 120, cacheFn);

		expect(result).toBe("result");
		expect(kv.get).toHaveBeenCalledTimes(1);
		expect(kv.put).toHaveBeenCalledTimes(1);
		expect(cacheFn).toHaveBeenCalledTimes(1);
		expect(waitUntil).toHaveBeenCalledTimes(1);
	});

	test("#purge", async () => {
		let kv = new MockKVNamespace();
		let waitUntil = waitUntilFactory();
		let cacheFn = mock().mockImplementation(() => "result");

		let cache = new Cache(kv, waitUntil);

		await cache.fetch("key", cacheFn);
		cache.purge("key");

		expect(kv.delete).toHaveBeenCalledTimes(1);
		expect(waitUntil).toHaveBeenCalledTimes(2);
		expect(cacheFn).toHaveBeenCalledTimes(1);
	});
});
