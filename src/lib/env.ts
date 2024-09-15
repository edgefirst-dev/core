import { EdgeContextError, EdgeEnvKeyError } from "./errors.js";
import type { Bindings } from "./types.js";

/**
 * Access environment variables in your Edge-first application.
 */
export class Env {
	constructor(protected bindings: Bindings) {
		if (!bindings) throw new EdgeContextError("env().fetch");
	}

	/**
	 * Retrieve a value from the environment variables.
	 * If the key is not found, an error is thrown.
	 * An optional fallback value can be provided.
	 * @param key The key to fetch from the environment variables.
	 * @param fallback An optional fallback value to return if the key is not found.
	 * @returns
	 */
	fetch<Key extends keyof Bindings>(
		key: Key,
		fallback?: Bindings[Key],
	): Bindings[Key] {
		let data = this.bindings[key];
		if (data) return data;

		if (fallback) return fallback;
		throw new EdgeEnvKeyError(key);
	}
}
