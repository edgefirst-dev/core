import { describe, expect, mock, test } from "bun:test";

import { FileUpload } from "@mjackson/form-data-parser";
import { MockR2Bucket } from "../mocks/cf";
import { FS } from "./fs.js";

describe(FS.name, () => {
	test("#constructor", () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		expect(fs).toBeInstanceOf(FS);
	});

	test("#binding", () => {
		let r2 = new MockR2Bucket();
		let fs = new FS(r2);

		expect(fs.binding).toEqual(r2);
	});

	test("#keys", async () => {
		let r2 = new MockR2Bucket([
			["test:1", { key: "test:1" }],
			["2", { key: "2" }],
		]);

		let fs = new FS(r2);

		let result = await fs.keys({});

		expect(r2.list).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			keys: ["test:1", "2"],
			done: true,
			cursor: null,
		});
	});

	test("#keys with prefix", async () => {
		let r2 = new MockR2Bucket([["test:1", { key: "test:1" }]]);

		let fs = new FS(r2);

		let result = await fs.keys({ prefix: "test" });

		expect(r2.list).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			keys: ["test:1"],
			done: true,
			cursor: null,
		});
	});

	test("#keys with limit", async () => {
		let r2 = new MockR2Bucket([
			["test:1", { key: "test:1" }],
			["2", { key: "2" }],
		]);

		let fs = new FS(r2);

		let result = await fs.keys({ limit: 1 });

		expect(r2.list).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			keys: ["test:1"],
			done: false,
			cursor: "1",
		});
	});

	test("#keys with cursor", async () => {
		let r2 = new MockR2Bucket([
			["test:1", { key: "test:1" }],
			["2", { key: "2" }],
		]);

		let fs = new FS(r2);

		let result = await fs.keys({ limit: 1, cursor: "1" });

		expect(r2.list).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			keys: ["2"],
			done: true,
			cursor: null,
		});
	});

	test("#serve", async () => {
		let arrayBuffer = new ArrayBuffer(8);
		let r2 = new MockR2Bucket([
			[
				"test:1",
				{ key: "test:1", arrayBuffer: () => Promise.resolve(arrayBuffer) },
			],
		]);

		let fs = new FS(r2);

		let response = await fs.serve("test:1");

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.arrayBuffer()).resolves.toEqual(arrayBuffer);
	});

	test("#serve with custom headers", async () => {
		let arrayBuffer = new ArrayBuffer(8);

		let r2 = new MockR2Bucket([
			[
				"test:1",
				{ key: "test:1", arrayBuffer: () => Promise.resolve(arrayBuffer) },
			],
		]);

		let fs = new FS(r2);

		let response = await fs.serve("test:1", {
			headers: {
				"content-type": "text/plain",
				"content-length": "8",
			},
		});

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.headers.get("content-type")).toBe("text/plain");
		expect(response.headers.get("content-length")).toBe("8");
	});

	test("#serve (not found)", async () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		let response = await fs.serve("test:1");

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(404);
	});

	test("#serve with fallback", async () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		let response = await fs.serve("test:1", { fallback: "fallback" });

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(404);
		expect(response.text()).resolves.toBe("fallback");
	});

	test("#serve with HTTP metadata", async () => {
		let arrayBuffer = new ArrayBuffer(8);
		let r2 = new MockR2Bucket([
			[
				"test:1",
				{
					key: "test:1",
					arrayBuffer: () => Promise.resolve(arrayBuffer),
					writeHttpMetadata(headers: Headers) {
						headers.set("content-type", "text/plain");
						headers.set("content-length", "8");
					},
				},
			],
		]);

		let fs = new FS(r2);

		let response = await fs.serve("test:1");

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.headers.get("content-type")).toBe("text/plain");
		expect(response.headers.get("content-length")).toBe("8");
	});

	test("#serve with HTTP metadata (error)", async () => {
		let arrayBuffer = new ArrayBuffer(8);
		let r2 = new MockR2Bucket([
			[
				"test:1",
				{
					key: "test:1",
					arrayBuffer: () => Promise.resolve(arrayBuffer),
					writeHttpMetadata(headers: Headers) {
						throw new Error("Failed to write metadata");
					},
				},
			],
		]);

		let fs = new FS(r2);

		let response = await fs.serve("test:1");

		expect(r2.get).toHaveBeenCalledTimes(1);
		expect(response.headers.get("content-type")).not.toBe("text/plain");
		expect(response.headers.get("content-length")).not.toBe("8");
	});

	test("#uploadHandler", async () => {
		let r2 = new MockR2Bucket();
		let fs = new FS(r2);

		let file = new File(["test"], "test.txt", { type: "text/plain" });

		let fileUpload = {
			fieldName: "file",
			name: "test.txt",
			type: "text/plain",
			arrayBuffer: () => file.arrayBuffer(),
		} as FileUpload;

		let uploadHandler = fs.uploadHandler(["file"]);

		expect(uploadHandler(fileUpload)).resolves.toEqual(file);
	});

	test("#uploadHandler with non-allowed field name", async () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		let file = new File(["test"], "test.txt", { type: "text/plain" });

		let fileUpload = {
			fieldName: "file",
			name: "test.txt",
			type: "text/plain",
			arrayBuffer: () => file.arrayBuffer(),
		} as FileUpload;

		let uploadHandler = fs.uploadHandler(["other"]);

		expect(uploadHandler(fileUpload)).resolves.toBeUndefined();
	});

	test("#uploadHandler with missing fieldName", async () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		let file = new File(["test"], "test.txt", { type: "text/plain" });

		let fileUpload = {
			name: "test.txt",
			type: "text/plain",
			arrayBuffer: () => file.arrayBuffer(),
		} as FileUpload;

		let uploadHandler = fs.uploadHandler(["file"]);

		expect(uploadHandler(fileUpload)).resolves.toBeUndefined();
	});

	test("#uploadHandler with getKey", async () => {
		let r2 = new MockR2Bucket();

		let fs = new FS(r2);

		let file = new File(["test"], "test.txt", { type: "text/plain" });

		let fileUpload = {
			fieldName: "file",
			name: "test.txt",
			type: "text/plain",
			arrayBuffer: () => file.arrayBuffer(),
		} as FileUpload;

		let getKeyFn = mock().mockImplementation(() => "key");

		let uploadHandler = fs.uploadHandler(["file"], getKeyFn);

		expect(uploadHandler(fileUpload)).resolves.toEqual(file);
		expect(getKeyFn).toHaveBeenCalledTimes(1);
		expect(getKeyFn).toHaveBeenCalledWith("test.txt");
	});
});
