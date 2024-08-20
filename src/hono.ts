import { createMiddleware } from "hono/factory";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export function edgeRuntime() {
	return createMiddleware<{
		Bindings: Bindings;
	}>((c, next) => storage.run(c, next));
}
