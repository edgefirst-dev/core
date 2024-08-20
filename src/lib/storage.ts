import { AsyncLocalStorage } from "node:async_hooks";
import type { Request } from "@cloudflare/workers-types";
import type { CloudflareProxy } from "./types.js";

export type EdgeFirstContext = {
	request: Request;
	cloudflare: CloudflareProxy;
};

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
