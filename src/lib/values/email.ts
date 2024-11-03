import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

import { EmailVerifier } from "../clients/email-verifier.js";

/**
 * The `Email` class represents an email address, providing methods to
 * validate, parse, and manipulate the email address components like username,
 * domain, and TLD. It also supports email validation through an external API.
 *
 * This class is immutable in its interface but allows controlled modifications
 * to the username, hostname, and TLD through getters and setters.
 */
export class Email {
	private value: string;
	protected verifier: Email.Verifier = new EmailVerifier();

	/**
	 * Creates and returns an Email object referencing the Email specified using
	 * an email string, or a base Email object
	 */
	constructor(email: string | Email) {
		if (email instanceof Email) {
			this.value = email.toString();
		} else if (this.isValid(email)) {
			this.value = email.trim();
		} else {
			throw new TypeError(`Invalid email ${email}`);
		}
	}

	/**
	 * Static factory method to create an `Email` object.
	 *
	 * @param email - A string representing an email address or another `Email` instance.
	 * @returns A new `Email` object.
	 */
	static from<T>(
		this: new (
			email: string | Email,
		) => T,
		email: string | Email,
	) {
		// biome-ignore lint/complexity/noThisInStatic: Needed for subclasses
		return new this(email);
	}

	/**
	 * Determines if the provided value can be parsed as a valid `Email`.
	 *
	 * This method checks whether the input is either an instance of the `Email`
	 * class or a valid email string that can be successfully parsed by the
	 * `Email.from()` method.
	 *
	 * @param email - The email value to check, which can either be a string or an instance of `Email`.
	 * @returns `true` if the value can be parsed as an `Email`, otherwise `false`.
	 *
	 * @example
	 * const result1 = Email.canParse("user@example.com"); // true
	 * const result2 = Email.canParse("invalid-email"); // false
	 * const emailInstance = Email.from("user@example.com");
	 * const result3 = Email.canParse(emailInstance); // true
	 */
	static canParse<M>(
		this: new (
			email: string | Email,
		) => M,
		email: string | Email,
	) {
		if (email instanceof Email) return true;
		try {
			// biome-ignore lint/complexity/noThisInStatic: Needed for subclasses
			new this(email);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Returns the full email address as a string.
	 *
	 * @returns A string representation of the email.
	 */
	public toString() {
		return this.value;
	}

	/**
	 * Serializes the email address to JSON format, returning the same value as `toString()`.
	 *
	 * @returns A string representation of the email for JSON serialization.
	 */
	public toJSON() {
		return this.value;
	}

	/**
	 * Returns the hash of the email address using the SHA-256 algorithm.
	 *
	 * @returns A string containing the SHA-256 hash of the email address.
	 */
	public get hash() {
		return encodeHexLowerCase(
			sha256(new TextEncoder().encode(this.value.toString())),
		);
	}

	/**
	 * Gets the username (part before the `@` symbol) of the email.
	 *
	 * @throws {Error} If the username is missing.
	 * @returns A string containing the username.
	 */
	public get username(): string {
		let username = this.value.split("@").at(0);
		if (!username) throw new Error("Missing username");
		return username;
	}

	/**
	 * Gets the domain (part after the `@` symbol) of the email.
	 *
	 * @throws {Error} If the domain is missing.
	 * @returns A string containing the domain.
	 */
	public get hostname(): string {
		let hostname = this.value.split("@").at(1);
		if (!hostname) throw new Error("Missing hostname");
		return hostname;
	}

	/**
	 * Retrieves the alias part of the email, which is the portion after the `+` symbol
	 * in the username, if it exists.
	 *
	 * If the username contains a `+`, this method returns the part of the username after the `+`.
	 * If there is no `+` in the username, it returns `undefined`.
	 *
	 * @returns The alias part of the email, or `undefined` if no alias is present.
	 *
	 * @example
	 * const email = Email.from("user+alias@example.com");
	 * console.log(email.alias); // "alias"
	 *
	 * const email2 = Email.from("user@example.com");
	 * console.log(email2.alias); // undefined
	 */
	get alias(): string | undefined {
		return this.username.split("+").at(1);
	}

	/**
	 * Sets the username of the email.
	 *
	 * @param value - The new username to set.
	 */
	public set username(value: string) {
		this.value = `${value}@${this.hostname}`;
	}

	/**
	 * Sets the domain (hostname) of the email.
	 *
	 * @param value - The new domain to set.
	 */
	public set hostname(value: string) {
		this.value = `${this.username}@${value}`;
	}

	/**
	 * Sets or updates the alias part of the email (the portion after the `+` symbol in the username).
	 * If `undefined` or an empty string is provided, the alias is removed.
	 *
	 * @param alias - The new alias to set. If `undefined` or empty, the alias will be removed.
	 *
	 * @example
	 * const email = Email.from("user@example.com");
	 * email.alias = "alias";
	 * console.log(email.toString()); // "user+alias@example.com"
	 *
	 * const email2 = Email.from("user+alias@example.com");
	 * email2.alias = undefined;
	 * console.log(email2.toString()); // "user@example.com"
	 */
	set alias(alias: string | undefined) {
		let [username] = this.username.split("+");
		if (!username) throw new Error("Missing username");

		// Set the new alias
		if (alias) this.username = `${username}+${alias}`;
		// Remove the alias if it's undefined or empty
		else this.username = username;
	}

	/**
	 * Verifies the email address using an external API.
	 *
	 * @throws {InvalidEmailError} If the email is not valid according to the API.
	 */
	public async verify() {
		return await this.verifier.verify(this);
	}

	/**
	 * Checks if the email's username contains a `+` followed by additional text,
	 * commonly referred to as an alias or "plus addressing".
	 *
	 * @returns `true` if the email contains an alias, otherwise `false`.
	 *
	 * @example
	 * const email = Email.from("user+alias@example.com");
	 * email.hasAlias(); // true
	 *
	 * const email2 = Email.from("user@example.com");
	 * email2.hasAlias(); // false
	 */
	public hasAlias(): boolean {
		return typeof this.alias === "string";
	}

	/**
	 * Validates the format of the provided email string.
	 *
	 * @param emailAddress - The email address to validate.
	 * @returns `true` if the email format is valid, otherwise `false`.
	 */
	private isValid(emailAddress: string): boolean {
		return /^.+@.+\..+$/.test(emailAddress);
	}
}

export namespace Email {
	export interface Verifier {
		verify(email: Email): Promise<void>;
	}
}
