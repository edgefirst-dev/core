import { storage } from "./lib/storage.js";
import type { CloudflareProxy } from "./lib/types.js";

export namespace getLoadContext {
	export interface FunctionArgs {
		request: Request;
		context: { cloudflare: CloudflareProxy };
	}
}

export function getLoadContext(args: getLoadContext.FunctionArgs) {
	return storage.run(
		{ request: args.request, cloudflare: args.context.cloudflare },
		() => args.context,
	);
}
