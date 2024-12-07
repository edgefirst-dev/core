import type { Message } from "@cloudflare/workers-types";
import type { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { defer } from "../storage/accessors.js";
import type { Job } from "./job.js";

/**
 * The `JobsManager` class is responsible for managing and processing jobs.
 * It registers job instances, processes batches of messages, and handles
 * individual messages by delegating them to the appropriate job.
 *
 * Each job is registered using the `register` method, and jobs are then
 * processed via `handle` or `processBatch`.
 *
 * @example
 * let manager = new JobsManager();
 * manager.register(new MyJob());
 * // The batch here comes from the CF Queue.
 * await manager.performBatch(batch, (error, message) => {
 *   console.error(error)
 *   message.retry();
 * });
 */
export class JobsManager {
	/** A map storing the registered jobs, keyed by their class name. */
	#jobs = new Map<string, Job<Data>>();

	constructor(jobs: Job<Data>[]) {
		for (let job of jobs) this.register(job);
	}

	/**
	 * Registers a job instance with the `JobsManager`, allowing it to process
	 * messages for that job.
	 *
	 * The job is stored in the internal job map, keyed by the job's class name.
	 *
	 * @param job - The job instance to register.
	 *
	 * @example
	 * manager.register(new MyJob());
	 */
	private register<T extends Job<Data>>(job: T): void {
		this.#jobs.set(job.constructor.name, job);
	}

	/**
	 * Processes a batch of messages, delegating each message to the appropriate
	 * job based on the `job` field in the message body.
	 *
	 * If an error occurs during processing, the optional `onError` function is
	 * called with the error and the message to help you debug and retry it.
	 *
	 * Every job processed in the batch is passed to waitUntil so that the batch
	 * is processed in parallel and doesn't need to be awaited.
	 *
	 * @param batch - The batch of messages to process.
	 * @param onError - An optional callback function to handle errors during processing.
	 *
	 * @example
	 * manager.performBatch(batch, (error, message) => {
	 *   console.error(error);
	 *   message.retry();
	 * });
	 */
	async processBatch(
		batch: MessageBatch,
		onError?: JobsManager.ErrorFunction,
	): Promise<void> {
		for (let message of batch.messages) {
			defer(this.process(message, onError));
		}
	}

	/**
	 * Process an individual message, delegating it to the appropriate job based
	 * on the `job` field in the message body.
	 *
	 * The method validates the message body, finds the corresponding job, and
	 * calls the `perform` method on the job.
	 *
	 * If the job is not registered or validation fails, an error is thrown.
	 *
	 * If an error occurs during processing, the optional `onError` function is
	 * called with the error and the message to help you debug and retry it.
	 *
	 * @param message - The message to process.
	 * @param onError - An optional callback function to handle errors during processing.
	 *
	 * @example
	 * await manager.perform(message, (error, message) => {
	 *   console.error(error);
	 *   message.retry();
	 * });
	 */
	async process(
		message: Message,
		onError?: JobsManager.ErrorFunction,
	): Promise<void> {
		try {
			let body = new ObjectParser(message.body);
			let jobName = body.string("job");
			let job = this.#jobs.get(jobName);
			if (!job) throw new Error(`Job ${jobName} not registered`);
			let input = await job.validate(body);
			await job.perform(input);
			message.ack();
		} catch (error) {
			if (onError) onError(error, message);
		}
	}
}

export namespace JobsManager {
	/**
	 * A type defining the error handling function signature.
	 *
	 * This function is called when an error occurs during message processing.
	 *
	 * @param error - The error that occurred.
	 * @param message - The message that was being processed when the error occurred.
	 */
	export type ErrorFunction = (error: unknown, message: Message) => void;
}
