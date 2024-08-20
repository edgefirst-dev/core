import type { D1Database } from "@cloudflare/workers-types";

/**
 * Access a SQL database in your Edge-first application to store and retrieve
 * relational data.
 */
export class DB {
	constructor(protected db: D1Database) {}

	/**
	 * Get the underlying connection to the D1 database
	 * This is useful if you need to integrate with a library that expects a D1
	 * database connection like Drizzle
	 */
	get connection() {
		return this.db;
	}

	/**
	 * Sends multiple SQL statements inside a single call to the database. This
	 * can have a huge performance impact as it reduces latency from network
	 * round trips to the database. Each statement in the list will execute and
	 * commit, sequentially, non-concurrently and return the results in the same
	 * order.
	 */
	get batch() {
		return this.db.batch.bind(this.db);
	}

	get dump() {
		return this.db.dump.bind(this.db);
	}

	/**
	 * Executes one or more queries directly without prepared statements or
	 * parameters binding. The input can be one or multiple queries separated by \n.
	 * If an error occurs, an exception is thrown with the query and error
	 * messages, execution stops and further statements are not executed.
	 */
	get exec() {
		return this.db.exec.bind(this.db);
	}

	/**
	 * Generates a prepared statement to be used later
	 */
	get prepare() {
		return this.db.prepare.bind(this.db);
	}
}
