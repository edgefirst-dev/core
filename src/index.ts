import { EdgeConfigError, EdgeContextError } from "./errors.js";
import { AI } from "./lib/ai.js";
import { Cache } from "./lib/cache.js";
import { DB } from "./lib/db.js";
import { FS } from "./lib/fs.js";
import { KV } from "./lib/kv.js";
import { storage } from "./lib/storage.js";

export namespace Edge {
	export function kv() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("kv");
		if ("KV" in context.env) return new KV(context.env.KV);
		throw new EdgeConfigError("KV");
	}

	export function fs() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("fs");
		if ("FS" in context.env) return new FS(context.env.FS);
		throw new EdgeConfigError("FS");
	}

	export function cache() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("cache");
		if ("KV" in context.env) {
			return new Cache(context.env.KV, context.ctx.waitUntil.bind(context.ctx));
		}
		throw new EdgeConfigError("KV");
	}

	export function db() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("db");
		if ("DB" in context.env) return new DB(context.env.DB);
		throw new EdgeConfigError("DB");
	}

	export function ai() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("ai");
		if ("AI" in context.env) return new AI(context.env.AI);
		throw new EdgeConfigError("AI");
	}

	export function env() {
		let context = storage.getStore();
		if (!context) throw new EdgeContextError("Env");
		return context?.env;
	}
}
