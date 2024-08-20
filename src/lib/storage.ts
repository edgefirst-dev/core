import { AsyncLocalStorage } from "node:async_hooks";
import type {
	Ai,
	D1Database,
	KVNamespace,
	Queue,
	R2Bucket,
} from "@cloudflare/workers-types";
import type { PlatformProxy } from "wrangler";

export type CfProperties = Record<string, unknown>;

export interface Bindings {
	KV: KVNamespace;
	DB: D1Database;
	FS: R2Bucket;
	AI: Ai;
	QUEUE: Queue;
}

export type EdgeFirstContext = Omit<
	PlatformProxy<Bindings, CfProperties>,
	"dispose"
>;

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
