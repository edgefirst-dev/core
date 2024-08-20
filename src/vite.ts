import {
	type Bindings,
	type EdgeFirstContext,
	storage,
} from "./lib/storage.js";

export namespace getLoadContext {
	export interface FunctionArgs {
		request: Request;
		context: { cloudflare: EdgeFirstContext };
	}
}

export function getLoadContext(args: getLoadContext.FunctionArgs) {
	return storage.run(args.context.cloudflare, () => args.context);
}

export type { Bindings as EdgeFirstEnv };
