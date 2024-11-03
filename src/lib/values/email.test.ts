import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/native";
import { EmailVerifier } from "../clients/verifier";
import { Email } from "./email";

mock.module("../storage/accessors.js", () => {
	return {
		env() {
			return {
				fetch(key: string): string {
					return key;
				},
			};
		},
	};
});

const value = "john@example.com";
const complex = "john.doe+service@company.example.com";

describe(Email.name, () => {
	test(".from() using string", () => {
		let email = Email.from(value);
		expect(email).toBeInstanceOf(Email);
	});

	test(".from() using Email", () => {
		let original = Email.from(value);
		let email = Email.from(original);
		expect(email).toBeInstanceOf(Email);
		expect(email.toString()).toBe(original.toString());
		expect(email).not.toBe(original); // Should be a new instance
	});

	test(".from() throw if it's invalid", () => {
		expect(() => Email.from("invalid")).toThrow();
		expect(() => Email.from("invalid@")).toThrow();
		expect(() => Email.from("@invalid")).toThrow();
		expect(() => Email.from("invalid@invalid")).toThrow();
	});

	test("#toString()", () => {
		let email = Email.from(value);
		expect(email.toString()).toBe(value);
	});

	test("#toJSON()", () => {
		let email = Email.from(value);
		expect(email.toJSON()).toBe(value);
	});

	test("get username", () => {
		let email = Email.from(value);
		expect(email.username).toBe("john");
	});

	test("get hostname", () => {
		let email = Email.from(value);
		expect(email.hostname).toBe("example.com");
	});

	test("get username with complex email", () => {
		let email = Email.from(complex);
		expect(email.username).toBe("john.doe+service");
	});

	test("get hostname with complex email", () => {
		let email = Email.from(complex);
		expect(email.hostname).toBe("company.example.com");
	});

	test("get alias", () => {
		let email = Email.from(complex);
		expect(email.alias).toBe("service");
	});

	test("get alias with simple email", () => {
		let email = Email.from(value);
		expect(email.alias).toBeUndefined();
	});

	test("#hash", () => {
		let email = Email.from(value);
		expect(email.hash.toString()).toBe(
			"855f96e983f1f8e8be944692b6f719fd54329826cb62e98015efee8e2e071dd4",
		);
	});

	test("set username", () => {
		let email = Email.from(value);
		email.username = "jane";
		expect(email.toString()).toBe("jane@example.com");
	});

	test("set hostname", () => {
		let email = Email.from(value);
		email.hostname = "example.net";
		expect(email.toString()).toBe("john@example.net");
	});

	test("set alias", () => {
		let email = Email.from(value);
		email.alias = "alias";
		expect(email.toString()).toBe("john+alias@example.com");
	});

	test("set alias to undefined", () => {
		let email = Email.from(complex);
		email.alias = undefined;
		expect(email.toString()).toBe("john.doe@company.example.com");
	});

	test("#hasAlias", () => {
		let email = Email.from(complex);
		expect(email.hasAlias()).toBeTrue();
	});

	test("#hasAlias with simple email", () => {
		let email = Email.from(value);
		expect(email.hasAlias()).toBeFalse();
	});

	test(".canParse", () => {
		expect(Email.canParse(value)).toBeTrue();
		expect(Email.canParse("invalid")).toBeFalse();
	});

	describe("#verify", () => {
		let server = setupServer();

		beforeAll(() => server.listen());
		afterAll(() => server.close());

		test("with valid email", async () => {
			let email = Email.from(value);
			server.resetHandlers(
				http.get(`https://verifier.meetchopra.com/verify/${value}`, () => {
					return HttpResponse.json({ status: true });
				}),
			);

			expect(email.verify()).resolves.toBeUndefined();
		});

		test("with invalid email", async () => {
			let email = Email.from(value);

			server.resetHandlers(
				http.get(`https://verifier.meetchopra.com/verify/${value}`, () => {
					return HttpResponse.json({
						status: false,
						error: { code: 2, message: "Disposable email address" },
					});
				}),
			);

			expect(email.verify()).rejects.toThrow();
		});
	});

	describe("Overwrite the verifier", () => {
		let verify = mock().mockImplementation(async (email: Email) => {
			if (email.hostname === "example.com") return;
			throw new EmailVerifier.InvalidEmailError(2, "Disposable email address");
		});

		class MyEmail extends Email {
			protected override verifier = { verify };
		}

		test("with custom verifier", async () => {
			let email = MyEmail.from(value);
			await email.verify();
			expect(verify).toHaveBeenCalledWith(email);
		});

		test("with failing custom verifier", async () => {
			let email = MyEmail.from(complex);
			expect(email.verify()).rejects.toThrow();
			expect(verify).toHaveBeenCalledWith(email);
		});
	});
});
