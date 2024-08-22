import { describe, test } from "bun:test";

import { Hono } from "hono";
import { edgeRuntime } from "./hono";
import {
	fs,
	type Bindings,
	cache,
	db,
	env,
	kv,
	request,
	signal,
	unstable_ai,
	unstable_geo,
	unstable_queue,
} from "./index";

let hono = new Hono<{ Bindings: Bindings }>();
hono.all(edgeRuntime());

describe("Edge", () => {
	describe(fs.name, () => {
		test.todo("fs().list");
		test.todo("fs().serve");
		test.todo("fs().head");
		test.todo("fs().upload");
		test.todo("fs().delete");
		test.todo("fs().download");
	});

	describe(cache.name, () => {
		test.todo("cache().fetch");
	});

	describe(db.name, () => {
		test.todo("db().connection");
		test.todo("db().batch");
		test.todo("db().dump");
		test.todo("db().exec");
		test.todo("db().prepare");
	});

	describe(env.name, () => {
		test.todo("env().fetch");
	});

	describe(kv.name, () => {
		test.todo("kv().keys");
		test.todo("kv().get");
		test.todo("kv().set");
		test.todo("kv().has");
		test.todo("kv().del");
	});

	describe(request.name, () => {
		test.todo("request().method");
	});

	describe(signal.name, () => {
		test.todo("signal().aborted");
	});

	describe(unstable_ai.name, () => {
		test.todo("unstable_ai().run");
	});

	describe(unstable_geo.name, () => {
		test.todo("unstable_geo().city");
	});

	describe(unstable_queue.name, () => {
		test.todo("unstable_queue().enqueue");
	});
});
