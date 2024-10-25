import type { Queue as WorkerQueue } from "@cloudflare/workers-types";
import type { Jsonifiable } from "type-fest";
import type { WaitUntilFunction } from "../types.js";

export namespace Queue {
	export type ContentType = "text" | "bytes" | "json" | "v8";

	export namespace Enqueue {
		export type Payload = Jsonifiable;

		export interface Options {
			contentType?: ContentType;
			delay?: number;
		}
	}
}

/**
 * Enqueue for processing later any kind of payload of data.
 */
export class Queue {
	constructor(
		protected queue: WorkerQueue,
		protected waitUntil: WaitUntilFunction,
	) {}

	get binding() {
		return this.queue;
	}

	enqueue<Payload extends Queue.Enqueue.Payload>(
		payload: Payload,
		options?: Queue.Enqueue.Options,
	) {
		this.waitUntil(this.queue.send(payload, options));
	}
}
