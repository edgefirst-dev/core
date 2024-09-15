import { describe, expect, test } from "bun:test";

import { Env } from "./env.js";
import { EdgeEnvKeyError } from "./errors.js";
import { Bindings } from "./types.js";

describe(Env.name, () => {
	let bindings = { KEY: "value" } as unknown as Bindings;

	test("#constructor", () => {
		let env = new Env(bindings);
		expect(env).toBeInstanceOf(Env);
	});

	test("#constructor with missing bindings", () => {
		// @ts-expect-error - Testing invalid input
		expect(() => new Env(undefined)).toThrow();
	});

	test("#fetch", () => {
		let env = new Env(bindings);
		expect(env.fetch("KEY")).toBe("value");
	});

	test("#fetch with fallback", () => {
		let env = new Env(bindings);
		expect(env.fetch("OPTIONAL", "fallback")).toBe("fallback");
	});

	test("#fetch with missing", () => {
		let env = new Env(bindings);
		expect(() => env.fetch("OPTIONAL")).toThrow(EdgeEnvKeyError);
	});
});

// Overwrite Bindings on this file
declare module "./types.js" {
	interface Bindings {
		KEY: string;
		OPTIONAL?: string;
	}
}
