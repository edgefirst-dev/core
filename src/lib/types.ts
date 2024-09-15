import type {
	Ai,
	D1Database,
	ExecutionContext,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";
import type { Session } from "./session.js";

export type WaitUntilFunction = ExecutionContext["waitUntil"];

export interface Bindings {
	KV: KVNamespace;
	DB: D1Database;
	FS: R2Bucket;
	AI: Ai;
	QUEUE: Queue;
}

export interface SessionData extends Session.Data {}
export interface SessionFlashData extends Session.Data {}
export interface DatabaseSchema extends Record<string, unknown> {}
