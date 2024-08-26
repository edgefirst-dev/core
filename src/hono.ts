import { createMiddleware } from "hono/factory";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

export function edgeRuntime() {
	return createMiddleware<{
		Bindings: Bindings;
	}>((c, next) => {
		let request = c.req.raw;
		let bindings = c.env;
		let waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);
		return storage.run({ request, bindings, waitUntil }, next);
	});
}
