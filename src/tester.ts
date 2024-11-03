import { mock } from "bun:test";
import type { Ai, R2Bucket } from "@cloudflare/workers-types";
import { storage } from "./lib/storage/storage.js";
import type { Bindings } from "./lib/types.js";
import { MockKVNamespace, MockQueue, MockR2Bucket } from "./mocks/cf.js";

export const request = new globalThis.Request("https://example.com", {
	headers: {
		"CF-Connecting-IP": "127.0.0.1",
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
	},
});

export const bindings: Bindings = {
	KV: new MockKVNamespace(),
	FS: new MockR2Bucket() as R2Bucket,
	QUEUE: new MockQueue(),
  
};

export function tester<T>(cb: () => T): T {
	return storage.setup(
		{
			request,
			bindings,
			ctx: {
				waitUntil(promise: Promise<unknown>) {},
				passThroughOnException() {},
			},
			options: {},
		},
		cb,
	);
}
