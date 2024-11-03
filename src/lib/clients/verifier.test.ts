import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/native";
import { Email } from "../values/email.js";
import { EmailVerifier } from "./verifier";

mock.module("../storage/accessors.js", () => {
	return {
		orm: mock(),
		env() {
			return {
				fetch(key: string) {
					return key;
				},
			};
		},
	};
});

describe(EmailVerifier.name, () => {
	let server = setupServer();
	let email = Email.from("john.doe@company.com");

	beforeAll(() => server.listen());
	afterAll(() => server.close());

	test("#constructor()", () => {
		const client = new EmailVerifier();
		expect(client).toBeInstanceOf(EmailVerifier);
	});

	test("#verify()", async () => {
		let client = new EmailVerifier();

		server.resetHandlers(
			http.get(`https://verifier.meetchopra.com/verify/${email}`, () => {
				return HttpResponse.json({ status: true });
			}),
		);

		expect(client.verify(email)).resolves.toBeUndefined();
	});

	test("#profile() with error", async () => {
		let client = new EmailVerifier();

		server.resetHandlers(
			http.get(`https://verifier.meetchopra.com/verify/${email}`, () => {
				return HttpResponse.json({
					status: false,
					error: { code: 2, message: "Disposable email address" },
				});
			}),
		);

		expect(client.verify(email)).rejects.toThrowError(
			EmailVerifier.InvalidEmailError,
		);
	});
});
