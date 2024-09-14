import { describe, expect, mock, test } from "bun:test";

import { KVNamespace } from "@cloudflare/workers-types";
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
	let get = mock().mockImplementation(async () => {
		return {};
	});
	let put = mock().mockImplementation(async () => void 0);
	let del = mock().mockImplementationOnce(async () => void 0);

	let kv = { get, put, delete: del } as unknown as KVNamespace;

	test("#constructor", () => {
		let storage = new WorkerKVSessionStorage(kv);
		expect(storage).toBeInstanceOf(WorkerKVSessionStorage);
	});

	test("#read", async () => {
		let storage = new WorkerKVSessionStorage(kv);
		let session = await storage.read();
		expect(session).toBeInstanceOf(Session);
		expect(get).toHaveBeenCalledTimes(1);
	});

	test("#read with id", async () => {
		let storage = new WorkerKVSessionStorage(kv);
		let session = await storage.read(crypto.randomUUID());
		expect(session).toBeInstanceOf(Session);
		expect(get).toHaveBeenCalledTimes(2);
	});

	test("#save", async () => {
		let storage = new WorkerKVSessionStorage(kv);
		let session = new Session(crypto.randomUUID(), {});
		await storage.save(session);
		expect(put).toHaveBeenCalledTimes(1);
	});

	test("#destroy", async () => {
		let storage = new WorkerKVSessionStorage(kv);
		let session = new Session(crypto.randomUUID(), {});
		await storage.destroy(session);
		expect(del).toHaveBeenCalledTimes(1);
	});
});
