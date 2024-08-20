import type {
	Ai,
	D1Database,
	ExecutionContext,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";
import type { PlatformProxy } from "wrangler";

export type WaitUntilFunction = ExecutionContext["waitUntil"];

export type CfProperties = Record<string, unknown>;

export type CloudflareProxy = Omit<
	PlatformProxy<Bindings, CfProperties>,
	"dispose"
>;

export interface Bindings {
	KV: KVNamespace;
	DB: D1Database;
	FS: R2Bucket;
	AI: Ai;
	QUEUE: Queue;
}
