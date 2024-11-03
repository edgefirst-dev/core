import { EdgeContextError, EdgeEnvKeyError } from "../errors.js";
import type { Environment } from "../types.js";

/**
 * Access environment variables in your Edge-first application.
 */
export class Env {
	constructor(protected env: Environment) {
		if (!env) throw new EdgeContextError("env().fetch");
	}

	/**
	 * Retrieve a value from the environment variables.
	 * If the key is not found, an error is thrown.
	 * An optional fallback value can be provided.
	 * @param key The key to fetch from the environment variables.
	 * @param fallback An optional fallback value to return if the key is not found.
	 * @returns
	 */
	fetch<Key extends keyof Environment>(
		key: Key,
		fallback?: Environment[Key],
	): Environment[Key] {
		let data = this.env[key];
		if (data) return data;

		if (fallback) return fallback;
		throw new EdgeEnvKeyError(key);
	}
}
