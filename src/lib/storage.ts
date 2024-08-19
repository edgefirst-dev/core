import { AsyncLocalStorage } from "node:async_hooks";
import type { Ai, D1Database, R2Bucket } from "@cloudflare/workers-types";
import type { KVNamespace } from "@cloudflare/workers-types/experimental/index.js";
import type { PlatformProxy } from "wrangler";

export type CfProperties = Record<string, unknown>;

export interface EdgeFirstEnv {
	KV: KVNamespace;
	DB: D1Database;
	FS: R2Bucket;
	AI: Ai;
}

export type EdgeFirstContext = Omit<
	PlatformProxy<EdgeFirstEnv, CfProperties>,
	"dispose"
>;

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
