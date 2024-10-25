import { store } from "./storage.js";

export function waitUntil(promise: Promise<unknown>) {
	return store("waitUntil")(promise);
}
