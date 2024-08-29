// Borrowed/modified from https://github.com/epicweb-dev/remember/blob/3131177752cb78d14c2c7bcfafbcb12fca70cdcf/index.test.ts

import { beforeEach, expect, test } from "bun:test";
import { forget, remember } from "./remember.js";

beforeEach(() => {
	// ensure global var empty before each test!
	// biome-ignore lint/performance/noDelete: This is ok
	delete globalThis.__remember_edgefist_dev_core;
});

// would use mock, but... https://twitter.com/kentcdodds/status/1700718653438931049
test("remember", () => {
	const key = Symbol("key");
	const rose = Symbol("rose");
	let returnValue = rose;
	const getValue = () => returnValue;
	expect(remember(key, getValue)).toBe(rose);
	returnValue = Symbol("bud");
	// because the name and getValue did not change, the value is remembered
	expect(remember(key, getValue)).toBe(rose);
});

test("forget", () => {
	const key = Symbol("key");
	// nothing remembered yet, trying to forget will "fail"
	expect(forget(key)).toBe(false);
	const rose = Symbol("rose");
	let returnValue = rose;
	const getValue = () => returnValue;
	expect(remember(key, getValue)).toBe(rose);
	// remembered value will be found and forgotten
	expect(forget(key)).toBe(true);
	returnValue = Symbol("bud");
	const bud = returnValue;
	// because the name has been forgotten, we should get the "new" value
	expect(remember(key, getValue)).toBe(bud);
});
