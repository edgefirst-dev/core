import type { ScheduledController } from "@cloudflare/workers-types";
import type { Task } from "./task.js";

export class TaskManager {
	#tasks = new Set<Task>();

	schedule<T extends Task>(task: T) {
		this.#tasks.add(task);
		return this;
	}

	async process(event: ScheduledController): Promise<void> {
		let now = new Date(event.scheduledTime);
		for (let task of this.#tasks) {
			if (this.shouldRunTask(task, now)) await task.perform();
		}
	}

	private shouldRunTask(task: Task, date: Date): boolean {
		if (!task.constraints) return true;
		return task.constraints.every((constraint: Task.Constraint) =>
			constraint(date),
		);
	}
}
