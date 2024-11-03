import { describe, expect, test } from "bun:test";

import { EdgeEnvKeyError } from "../errors.js";
import { Environment } from "../types.js";
import { Env } from "./env.js";

describe(Env.name, () => {
	let environment = { KEY: "value" } as unknown as Environment;

	test("#constructor", () => {
		let env = new Env(environment);
		expect(env).toBeInstanceOf(Env);
	});

	test("#constructor with missing environment", () => {
		// @ts-expect-error - Testing invalid input
		expect(() => new Env(undefined)).toThrow();
	});

	test("#fetch", () => {
		let env = new Env(environment);
		expect(env.fetch("KEY")).toBe("value");
	});

	test("#fetch with fallback", () => {
		let env = new Env(environment);
		expect(env.fetch("OPTIONAL", "fallback")).toBe("fallback");
	});

	test("#fetch with missing", () => {
		let env = new Env(environment);
		expect(() => env.fetch("OPTIONAL")).toThrow(EdgeEnvKeyError);
	});
});

// Overwrite Environment on this file
declare module "../types.js" {
	interface Environment {
		KEY: string;
		OPTIONAL?: string;
	}
}
