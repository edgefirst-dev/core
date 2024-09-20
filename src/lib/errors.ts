export class EdgeContextError extends Error {
	override name = "EdgeContextError";

	constructor(method: string) {
		super(`You must run "${method}()" from inside an Edge-first context.`);
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

export class EdgeRequestGeoError extends Error {
	override name = "EdgeRequestGeoError";
	override message =
		"The request object does not contain the 'cf' property required to access the geolocation information.";
}
