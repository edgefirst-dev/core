export class EdgeContextError extends Error {
	override name = "EdgeContextError";

	constructor(method: string) {
		super(`You must run "Edge.${method}" from inside an Edge-first context.`);
	}
}

export class EdgeConfigError extends Error {
	override name = "EdgeConfigError";

	constructor(key: string) {
		super(`Configure ${key} in your wrangler.toml file.`);
	}
}

export class EdgeEnvKeyError extends Error {
	override name = "EdgeEnvKeyError";

	constructor(key: string) {
		super(`Key not found: ${key}`);
	}
}
