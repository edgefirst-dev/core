import { createMiddleware } from "hono/factory";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

/**
 * Creates an Edge-first Runtime middleware for Hono. Any request after this
 * will have access to the Edge environment.
 * @returns A Hono middleware that provides access to the Edge environment.
 * @example
 * app.use(edgeRuntime());
 * app.get("/", async () => {
 *   let data = await kv().get("key");
 *   // more code
 * })
 */
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
