import { APIClient } from "@edgefirst-dev/api-client";
import { ObjectParser } from "@edgefirst-dev/data/parser";

import { env } from "../storage/accessors.js";
import type { Email } from "../values/email.js";

export class EmailVerifier extends APIClient {
	constructor() {
		super(new URL("https://verifier.meetchopra.com"));
	}

	override async before(request: Request) {
		let url = new URL(request.url);
		let apiKey = env().fetch("VERIFIER_API_KEY");
		if (apiKey) url.searchParams.append("token", apiKey);
		return new Request(url.toString(), request);
	}

	public async verify(value: Email) {
		let response = await this.get(`/verify/${value.toString()}`);

		let result = await response.json();

		let parser = new ObjectParser(result);

		if (parser.boolean("status")) return;
		let error = parser.object("error");

		throw new EmailVerifier.InvalidEmailError(
			error.number("code"),
			error.string("message"),
		);
	}
}

export namespace EmailVerifier {
	/**
	 * The `InvalidEmailError` is thrown when an email fails verification by the
	 * external API.
	 */
	export class InvalidEmailError extends Error {
		override name = "InvalidEmailError";

		/**
		 * Constructs an `InvalidEmailError` with a specific error code and message.
		 *
		 * @param code - The error code returned by the API.
		 * @param message - The error message returned by the API.
		 */
		constructor(
			public code: number,
			message: string,
		) {
			super(message);
		}
	}
}
