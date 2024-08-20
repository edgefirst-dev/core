import { AsyncLocalStorage } from "node:async_hooks";
import type { PlatformProxy } from "wrangler";
import type { Bindings, CfProperties } from "./types.js";

export type EdgeFirstContext = Omit<
	PlatformProxy<Bindings, CfProperties>,
	"dispose"
>;

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
