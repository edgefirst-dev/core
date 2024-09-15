import { describe, expect, test } from "bun:test";

import { MockKVNamespace } from "../mocks/cf.js";
import { Session, WorkerKVSessionStorage } from "./session.js";

describe(Session.name, () => {
	let id = crypto.randomUUID();
	let name = "Sergio";

	test("#constructor", () => {
		let session = new Session(id, { name });
		expect(session).toBeInstanceOf(Session);
	});

	test("get id", () => {
		let session = new Session(id, { name });
		expect(session.id).toEqual(id);
	});

	test("get data", () => {
		let session = new Session(id, { name });
		expect(session.data).toEqual({ name });
	});

	test("get isDirty (clean)", () => {
		let session = new Session(id, { name });
		expect(session.isDirty).toEqual(false);
	});

	test("get isDirty (dirty)", () => {
		let session = new Session<{ name: string }>(id, { name });
		session.set("name", "Daniel");
		expect(session.isDirty).toEqual(true);
	});

	test("#has", () => {
		let session = new Session<{ name: string; age: number }>(id, { name });
		expect(session.has("name")).toEqual(true);
		expect(session.has("age")).toEqual(false);
	});

	test("#set", () => {
		let session = new Session<{ name: string }>(id, { name });
		session.set("name", "Daniel");
		expect(session.data.name).toEqual("Daniel");
	});

	test("#get", () => {
		let session = new Session<{ name: string }>(id, { name });
		expect(session.get("name")).toEqual(name);
	});

	test("#del", () => {
		let session = new Session<{ name: string }>(id, { name });
		session.del("name");
		expect(session.data.name).toBeUndefined();
	});

	test("#flash", () => {
		let session = new Session<{ name: string }, { key: string }>(id, { name });
		session.flash("key", "test1");
		expect(session.data.__flash_key__).toEqual("test1");
	});

	describe("Flash Data", () => {
		test("#get", () => {
			let session = new Session<{ name: string }, { key: string }>(id, {
				name,
			});
			session.flash("key", "test1");
			expect(session.get("key")).toEqual("test1");
			expect(session.get("key")).toBeUndefined();
		});

		test("#has", () => {
			let session = new Session<{ name: string }, { key: string }>(id, {
				name,
			});
			session.flash("key", "test1");
			expect(session.has("key")).toEqual(true);
		});
	});
});

describe(WorkerKVSessionStorage.name, () => {
	test("#constructor", () => {
		let kv = new MockKVNamespace();
		let storage = new WorkerKVSessionStorage(kv);
		expect(storage).toBeInstanceOf(WorkerKVSessionStorage);
	});

	test("#read", async () => {
		let kv = new MockKVNamespace();
		let storage = new WorkerKVSessionStorage(kv);
		let session = await storage.read();
		expect(session).toBeInstanceOf(Session);
		expect(kv.get).toHaveBeenCalledTimes(1);
	});

	test("#read with id", async () => {
		let kv = new MockKVNamespace();
		let storage = new WorkerKVSessionStorage(kv);
		let session = await storage.read(crypto.randomUUID());
		expect(session).toBeInstanceOf(Session);
		expect(kv.get).toHaveBeenCalledTimes(1);
	});

	test("#save", async () => {
		let kv = new MockKVNamespace();
		let storage = new WorkerKVSessionStorage(kv);
		let session = new Session(crypto.randomUUID(), {});
		await storage.save(session);
		expect(kv.put).toHaveBeenCalledTimes(1);
	});

	test("#destroy", async () => {
		let kv = new MockKVNamespace();
		let storage = new WorkerKVSessionStorage(kv);
		let session = new Session(crypto.randomUUID(), {});
		await storage.destroy(session);
		expect(kv.delete).toHaveBeenCalledTimes(1);
	});
});
