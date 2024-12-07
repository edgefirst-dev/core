import type { ScheduledController } from "@cloudflare/workers-types";
import { defer } from "../storage/accessors.js";
import type { Task } from "./task.js";

export class TaskManager {
	#tasks: Set<Task>;

	constructor(tasks: Task[]) {
		this.#tasks = new Set(tasks);
	}

	process(event: ScheduledController): void {
		let now = new Date(event.scheduledTime);
		for (let task of this.#tasks) {
			if (this.shouldRunTask(task, now)) defer(task.perform());
		}
	}

	private shouldRunTask(task: Task, date: Date): boolean {
		if (!task.constraints) return true;
		return task.constraints.every((constraint: Task.Constraint) =>
			constraint(date),
		);
	}
}
