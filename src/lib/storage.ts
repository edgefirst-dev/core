import { AsyncLocalStorage } from "node:async_hooks";
import type { Bindings, WaitUntilFunction } from "./types.js";

export type EdgeFirstContext = {
	request: Request;
	bindings: Bindings;
	waitUntil: WaitUntilFunction;
};

export const storage = new AsyncLocalStorage<EdgeFirstContext>();
