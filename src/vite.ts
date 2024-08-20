import type { AppLoadContext } from "@remix-run/server-runtime";
import { storage } from "./lib/storage.js";
import type { CloudflareProxy } from "./lib/types.js";

export namespace getLoadContext {
	export type Callback = (args: FunctionArgs) => AppLoadContext;

	export interface FunctionArgs {
		request: Request;
		context: { cloudflare: CloudflareProxy };
	}
}

export function getLoadContext(callback?: getLoadContext.Callback) {
	return (args: getLoadContext.FunctionArgs) => {
		return storage.run(
			{ request: args.request, cloudflare: args.context.cloudflare },
			() => (callback ? callback(args) : (args.context as AppLoadContext)),
		);
	};
}
