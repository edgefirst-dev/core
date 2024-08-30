/**
 * The [Hono](https://hono.dev) middleware setups the Edge-first runtime for
 * the rest of your Remix application.
 *
 * Without this middleware using any of the functions provided from
 * `@edgefirst-dev/core` will result in an error being thrown.
 *
 * @module hono
 */
import { createMiddleware } from "hono/factory";
import { storage } from "./lib/storage.js";
import type { Bindings } from "./lib/types.js";

/**
 * Creates an Edge-first Runtime middleware for Hono. Any request after this
 * will have access to the Edge environment.
 * @returns A Hono middleware that provides access to the Edge environment.
 *
 * @example
 * app.use(edgeRuntime());
 * app.get("/", async () => {
 *   let data = await kv().get("key");
 *   // more code
 * });
 *
 * @example
 * app.use(edgeRuntime());
 *
 * app.use(async (c, next) => {
 *   let serverBuild = await importServerBuild();
 *   let handler = remix({
 *     build: serverBuild,
 *     mode: import.meta.env.PROD ? "production" : "development",
 *   });
 *   return handler(c, next);
 * });
 *
 * function importServerBuild(): Promise<ServerBuild> {
 *   if (process.env.NODE_ENV === "development") {
 *     return import("virtual:remix/server-build");
 *   }
 *   return import("../build/server");
 * }
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
