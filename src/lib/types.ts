import type { BrowserWorker } from "@cloudflare/puppeteer";
import type {
	Ai,
	D1Database,
	ExecutionContext,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";

export type WaitUntilFunction = ExecutionContext["waitUntil"];

export interface Environment {
	// Cloudflare Bindings
	AI: Ai;
	DB: D1Database;
	FS: R2Bucket;
	KV: KVNamespace;
	QUEUE: Queue;
	BROWSER: BrowserWorker;
	// Environment variables
	VERIFIER_API_KEY?: string;
}

export interface DatabaseSchema extends Record<string, unknown> {}
