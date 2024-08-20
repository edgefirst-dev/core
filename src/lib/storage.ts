import { AsyncLocalStorage } from "node:async_hooks";
import type { Context } from "hono";
import type { Bindings } from "./types.js";

// biome-ignore lint/suspicious/noExplicitAny: This is ok
export type EdgeFirstContext = Context<{ Bindings: Bindings }, any, object>;

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
