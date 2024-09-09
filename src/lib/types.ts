import type {
	Ai,
	D1Database,
	ExecutionContext,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";

export type WaitUntilFunction = ExecutionContext["waitUntil"];

export interface Bindings {
	KV: KVNamespace;
	DB: D1Database;
	FS: R2Bucket;
	AI: Ai;
	QUEUE: Queue;
}
