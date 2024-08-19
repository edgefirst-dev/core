import { expect, test } from "bun:test";

import { doSomething } from ".";

test(doSomething.name, () => {
	expect(() => doSomething()).toThrowError("Not implemented yet");
});
