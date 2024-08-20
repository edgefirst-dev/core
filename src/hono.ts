import { createMiddleware } from "hono/factory";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export function edgeRuntime() {
	return createMiddleware<{
		Bindings: Bindings;
	}>(storage.run);
}
