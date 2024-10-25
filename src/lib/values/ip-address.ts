import { isIP } from "node:net";
import type { Request } from "@cloudflare/workers-types";

/**
 * The `IPAddress` class represents an IP address, providing methods to
 * validate, parse, and determine the version of the IP address (IPv4 or IPv6).
 *
 * The class supports constructing from a string or another `IPAddress`
 * instance, as well as extracting an IP address from a request header. It also
 * provides utility methods for checking IP version and serializing the IP
 * address.
 *
 * @example
 * const ip = IPAddress.from("192.168.1.1");
 * console.log(ip.isV4); // true
 * console.log(ip.version); // 4
 */
export class IPAddress {
	private value: string;

	/**
	 * Constructs an `IPAddress` instance from a string or another `IPAddress`.
	 *
	 * @param ip - The IP address as a string or another `IPAddress` instance.
	 * @throws {TypeError} If the provided IP address is invalid.
	 */
	constructor(ip: string | IPAddress) {
		if (ip instanceof IPAddress) {
			this.value = ip.toString();
		} else if (this.isValid(ip)) {
			this.value = ip.trim();
		} else {
			throw new TypeError(`Invalid IP address ${ip}`);
		}
	}

	/**
	 * Creates a new `IPAddress` instance from a string or another `IPAddress`.
	 *
	 * @param ip - The IP address to parse, either as a string or an `IPAddress` instance.
	 * @returns A new `IPAddress` instance.
	 */
	static from(ip: string | IPAddress) {
		return new IPAddress(ip);
	}

	/**
	 * Extracts an IP address from a `Request` object by checking the
	 * `CF-Connecting-IP` header.
	 *
	 * @param request - The incoming request containing headers.
	 * @returns A new `IPAddress` instance if the IP is present in the headers, otherwise `null`.
	 */
	static fromRequest(request: Request) {
		let header = request.headers.get("CF-Connecting-IP");
		if (!header) return null;
		return IPAddress.from(header);
	}

	/**
	 * Checks if a value can be parsed as a valid `IPAddress`.
	 *
	 * @param ip - The IP address to check, either as a string or an `IPAddress` instance.
	 * @returns `true` if the IP address can be parsed, otherwise `false`.
	 */
	static canParse(ip: string | IPAddress) {
		if (ip instanceof IPAddress) return true;
		try {
			IPAddress.from(ip);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Gets the version of the IP address (4 for IPv4 or 6 for IPv6).
	 *
	 * @returns `4` if the IP is IPv4, `6` if IPv6.
	 * @throws {Error} If the IP address is invalid.
	 */
	get version(): 6 | 4 {
		if (isIP(this.value) === 4) return 4;
		if (isIP(this.value) === 6) return 6;
		throw new Error(`Invalid IP address: ${this.value}`);
	}

	/**
	 * Checks if the IP address is IPv4.
	 *
	 * @returns `true` if the IP address is IPv4, otherwise `false`.
	 */
	get isV4() {
		return this.version === 4;
	}

	/**
	 * Checks if the IP address is IPv6.
	 *
	 * @returns `true` if the IP address is IPv6, otherwise `false`.
	 */
	get isV6() {
		return this.version === 6;
	}

	/**
	 * Validates whether the given string is a valid IP address.
	 *
	 * @param ip - The IP address as a string.
	 * @returns `true` if the IP address is valid, otherwise `false`.
	 */
	private isValid(ip: string) {
		return isIP(ip) !== 0;
	}

	/**
	 * Returns the IP address as a string.
	 *
	 * @returns The IP address.
	 */
	toString() {
		return this.value;
	}

	/**
	 * Serializes the IP address to a JSON-compatible format.
	 *
	 * @returns The IP address as a string.
	 */
	toJSON() {
		return this.value;
	}

	/**
	 * Returns the primitive value of the IP address.
	 *
	 * @returns The IP address as a string.
	 */
	valueOf() {
		return this.value;
	}
}
