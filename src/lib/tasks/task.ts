/**
 * Copied from Superflare scheduled tasks
 * @see https://github.com/jplhomer/superflare/blob/cdeb3068e410340c7eb5f1b1d997bf95ae61e3a0/packages/superflare/src/scheduled.ts#L49-L55
 */
const where = {
	minute: (minute: number) => (date: Date) => date.getMinutes() === minute,
	hour: (hour: number) => (date: Date) => date.getHours() === hour,
	day: (day: number) => (date: Date) => date.getDay() === day,
	date: (monthDate: number) => (date: Date) => date.getDate() === monthDate,
	month: (month: number) => (date: Date) => date.getMonth() === month,
};

export namespace Task {
	export type Constraint = (date: Date) => boolean;
}

export abstract class Task {
	constraints: Task.Constraint[] = [];

	/**
	 * Run every minute.
	 */
	everyMinute(): this {
		return this;
	}

	/**
	 * Run hourly at the top.
	 */
	hourly(): this {
		this.constraints.push(where.minute(0));

		return this;
	}

	/**
	 * Run daily at midnight UTC.
	 */
	daily(): this {
		this.constraints.push(where.minute(0));
		this.constraints.push(where.hour(0));

		return this;
	}

	/**
	 * Run daily at a specific time UTC.
	 */
	dailyAt(time: string): this {
		let [hour, minute] = time.split(":");
		this.constraints.push(where.minute(Number.parseInt(minute ?? "0", 10)));
		this.constraints.push(where.hour(Number.parseInt(hour ?? "0", 10)));

		return this;
	}

	/**
	 * Run weekly on Sunday at midnight UTC.
	 */
	weekly(): this {
		this.constraints.push(where.day(0));
		this.constraints.push(where.hour(0));
		this.constraints.push(where.minute(0));

		return this;
	}

	/**
	 * Run weekly on a specific day of the week at a specific time UTC.
	 */
	weeklyOn(day: string, time: string): this {
		let [hour, minute] = time.split(":");
		this.constraints.push(where.day(Number.parseInt(day, 10)));
		this.constraints.push(where.minute(Number.parseInt(minute ?? "0", 10)));
		this.constraints.push(where.hour(Number.parseInt(hour ?? "0", 10)));

		return this;
	}

	/**
	 * Run monthly on the first day of the month at midnight UTC.
	 */
	monthly(): this {
		this.constraints.push(where.date(1));
		this.constraints.push(where.hour(0));
		this.constraints.push(where.minute(0));

		return this;
	}

	/**
	 * Run monthly on a specific date of the month at a specific time UTC.
	 */
	monthlyOn(date: string, time: string): this {
		let [hour, minute] = time.split(":");
		this.constraints.push(where.date(Number.parseInt(date, 10)));
		this.constraints.push(where.minute(Number.parseInt(minute ?? "0", 10)));
		this.constraints.push(where.hour(Number.parseInt(hour ?? "0", 10)));

		return this;
	}

	yearly(): this {
		// Months are 0-based, LOL
		this.constraints.push(where.month(0));
		this.constraints.push(where.date(1));
		this.constraints.push(where.hour(0));
		this.constraints.push(where.minute(0));

		return this;
	}

	abstract perform(): Promise<void>;
}
