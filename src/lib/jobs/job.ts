import type { Data } from "@edgefirst-dev/data";
import type { ObjectParser } from "@edgefirst-dev/data/parser";
import { store } from "../storage.js";

/**
 * The `Job` class provides a structure for defining and processing background jobs with automatic validation.
 *
 * Each subclass must define a `data` class, which extends
 * `Data<ObjectParser>`, to represent the input structure.
 *
 * The `Job` class will automatically instantiate the `data` class during
 * validation using the provided `ObjectParser`.
 *
 * Subclasses only need to define the `data` attribute and implement the
 * `perform` method to process the job.
 *
 * @template Input - The type of data the job will process, which must extend `Data<ObjectParser>`.
 *
 * @example
 * class MyData extends Data<ObjectParser> {
 *   get userId(): number {
 *     return this.parser.getNumber("userId");
 *   }
 * }
 *
 * class MyJob extends Job<MyData> {
 *   protected readonly data = MyData;
 *
 *   async perform(input: MyData): Promise<void> {
 *     console.log(`Processing job for user ID: ${input.userId}`);
 *   }
 * }
 *
 * // Enqueue a job with the provided data.
 * MyJob.enqueue({ userId: 123 });
 */
export abstract class Job<Input extends Data> {
	/**
	 * The `Data` class for this job, which is used for validation. Must be
	 * defined by subclasses.
	 */
	protected abstract readonly data: new (
		parser: ObjectParser,
	) => Input;

	/**
	 * Validates the incoming data using the `data` class defined in the subclass.
	 *
	 * This method automatically creates an instance of the `data` class using the provided `ObjectParser`.
	 *
	 * @param body - The `ObjectParser` containing the incoming data.
	 * @returns A promise that resolves to the validated `Input` data.
	 */
	async validate(body: ObjectParser): Promise<Input> {
		return new this.data(body);
	}

	/**
	 * Abstract method that defines the job's logic after the data has been
	 * validated.
	 *
	 * Subclasses must implement this method to define the actions taken with the
	 * validated input.
	 *
	 * @param input - The validated input data.
	 * @returns A promise that resolves once the job processing is complete.
	 */
	abstract perform(input: Input): Promise<void>;

	/**
	 * Enqueues a job with the provided message, adding it to the job queue for
	 * future processing.
	 *
	 * This static method allows jobs to be scheduled by adding the job name and
	 * the message to the queue.
	 *
	 * @param message - An object containing the job data to be enqueued.
	 *
	 * @example
	 * MyJob.enqueue({ userId: 123, action: 'process' });
	 */
	static enqueue<T extends object>(message: T) {
		// biome-ignore lint/complexity/noThisInStatic: We need it for better DX
		store("queue").enqueue({ job: this.name, ...message });
	}
}
