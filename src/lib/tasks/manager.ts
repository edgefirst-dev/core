import type { ScheduledController } from "@cloudflare/workers-types";
import { waitUntil } from "../wait-until.js";
import type { Task } from "./task.js";

export class TaskManager {
	#tasks = new Set<Task>();

	schedule<T extends Task>(task: T) {
		this.#tasks.add(task);
		return this;
	}

	process(event: ScheduledController): void {
		let now = new Date(event.scheduledTime);
		for (let task of this.#tasks) {
			if (this.shouldRunTask(task, now)) waitUntil(task.perform());
		}
	}

	private shouldRunTask(task: Task, date: Date): boolean {
		if (!task.constraints) return true;
		return task.constraints.every((constraint: Task.Constraint) =>
			constraint(date),
		);
	}
}
