import type {
	Ai,
	D1Database,
	ExecutionContext,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";

export type WaitUntilFunction = ExecutionContext["waitUntil"];
export type PassThroughOnExceptionFunction =
	ExecutionContext["passThroughOnException"];

export interface Bindings {
	AI: Ai;
	DB: D1Database;
	FS: R2Bucket;
	KV: KVNamespace;
	QUEUE: Queue;
}

export interface DatabaseSchema extends Record<string, unknown> {}
