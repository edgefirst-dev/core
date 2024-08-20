import { describe, test } from "bun:test";

import { Edge } from "./index";

describe("Edge", () => {
	describe(Edge.kv.name, () => {
		test.todo("Edge.kv().keys");
		test.todo("Edge.kv().get");
		test.todo("Edge.kv().set");
		test.todo("Edge.kv().has");
		test.todo("Edge.kv().del");
	});

	describe(Edge.fs.name, () => {
		test.todo("Edge.fs().list");
		test.todo("Edge.fs().serve");
		test.todo("Edge.fs().head");
		test.todo("Edge.fs().upload");
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

	describe(Edge.unstable_ai.name, () => {
		test.todo("Edge.unstable_ai().run");
	});
});
