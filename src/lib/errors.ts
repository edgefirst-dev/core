export class EdgeError extends Error {
	override name = "EdgeError";
}

export class EdgeContextError extends EdgeError {
	override name = "EdgeContextError";

	constructor(method: string) {
		super(`You must run "${method}()" from inside an Edge-first context.`);
	}
}

export class EdgeConfigError extends EdgeError {
	override name = "EdgeConfigError";

	constructor(key: string) {
		super(`Configure ${key} in your wrangler.toml file.`);
	}
}

export class EdgeBootstrapConfigError extends EdgeError {
	override name = "EdgeBootstrapConfigError";

	constructor(key: string) {
		super(`Configure ${key} in your bootstrap options.`);
	}
}

export class EdgeEnvKeyError extends EdgeError {
	override name = "EdgeEnvKeyError";

	constructor(key: string) {
		super(`Key not found: ${key}`);
	}
}

export class EdgeRequestGeoError extends EdgeError {
	override name = "EdgeRequestGeoError";
	override message =
		"The request object does not contain the 'cf' property required to access the geolocation information.";
}
