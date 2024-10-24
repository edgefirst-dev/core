import type {
	Ai,
	D1Database,
	ExecutionContext,
	Fetcher,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";
import type { Session } from "./session.js";

export type WaitUntilFunction = ExecutionContext["waitUntil"];

export interface Bindings {
	AI: Ai;
	DB: D1Database;
	FS: R2Bucket;
	KV: KVNamespace;
	QUEUE: Queue;
}

export interface SessionData extends Session.Data {}
export interface SessionFlashData extends Session.Data {}
export interface DatabaseSchema extends Record<string, unknown> {}
