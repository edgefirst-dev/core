import { describe, test } from "bun:test";

import { Edge } from "./index";

describe("Edge", () => {
	describe(Edge.kv.name, () => {
		test("Edge.kv().keys", async () => {
			let { items, meta } = await Edge.kv().keys();
		});

		test("Edge.kv().get", async () => {
			let { data, meta } = await Edge.kv().get("prefix:key");
		});

		test("Edge.kv().set", async () => {
			await Edge.kv().set(
				"prefix:key",
				{ date: new Date() },
				{ ttl: 3600, metadata: { key: "value" } },
			);
		});

		test("Edge.kv().has", async () => {
			let exists = await Edge.kv().has("prefix:key");
		});

		test("Edge.kv().del", async () => {
			await Edge.kv().del("prefix:key");
		});
	});

	describe(Edge.fs.name, () => {
		test("Edge.fs().list", async () => {
			let { files, cursor, done, folders } = await Edge.fs().list("prefix", {
				limit: 10,
				cursor: "",
			});
		});

		test.todo("Edge.fs().server");

		test.todo("Edge.fs().head");

		test("Edge.fs().upload", async () => {
			let { pathname, contentType, size, uploadedAt, meta } =
				await Edge.fs().upload(
					"avatar",
					new Blob(["content"], { type: "text/plain" }),
					{ prefix: "username", addRandomSuffix: true },
				);
		});

		test.todo("Edge.fs().delete");

		test.todo("Edge.fs().download");
	});

	describe(Edge.cache.name, () => {
		test.todo("Edge.cache().fetch");
	});

	describe(Edge.db.name, () => {
		test.todo("Edge.db().connection");
		test.todo("Edge.db().batch");
		test.todo("Edge.db().dump");
		test.todo("Edge.db().exec");
		test.todo("Edge.db().prepare");
	});

	describe(Edge.ai.name, () => {
		test.todo("Edge.ai().run");
	});
});
