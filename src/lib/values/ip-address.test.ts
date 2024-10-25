import { describe, expect, test } from "bun:test";

import { Request } from "@cloudflare/workers-types";
import { IPAddress } from "./ip-address";

describe(IPAddress.name, () => {
	test("#constructor with string", () => {
		let ip = new IPAddress("127.0.0.1");
		expect(ip).toBeInstanceOf(IPAddress);
	});

	test("#constructor with IPAddress", () => {
		let ip = new IPAddress("127.0.0.1");
		let ip2 = new IPAddress(ip);
		expect(ip2).toBeInstanceOf(IPAddress);
		expect(ip).not.toBe(ip2);
	});

	test(".from", () => {
		let ip = IPAddress.from("127.0.0.1");
		expect(ip).toBeInstanceOf(IPAddress);
	});

	test(".fromRequest", () => {
		let request = new globalThis.Request("https://example.com", {
			headers: { "CF-Connecting-IP": "127.0.0.1" },
		});

		let ip = IPAddress.fromRequest(request as unknown as Request);

		expect(ip).toBeInstanceOf(IPAddress);
	});

	test(".canParse with string", () => {
		expect(IPAddress.canParse("127.0.0.1")).toBe(true);
	});

	test(".canParse with IPAddress", () => {
		let ip = IPAddress.from("127.0.0.1");
		expect(IPAddress.canParse(ip)).toBe(true);
	});

	test("get version", () => {
		expect(IPAddress.from("127.0.0.1").version).toBe(4);
		expect(
			IPAddress.from("2001:0db8:85a3:0000:0000:8a2e:0370:7334").version,
		).toBe(6);
	});

	test("get isV4", () => {
		expect(IPAddress.from("127.0.0.1").isV4).toBeTrue();
	});

	test("get isV6", () => {
		expect(
			IPAddress.from("2001:0db8:85a3:0000:0000:8a2e:0370:7334").isV6,
		).toBeTrue();
	});

	test("#toString", () => {
		let ip = IPAddress.from("127.0.0.1");
		expect(ip.toString()).toBe("127.0.0.1");
	});

	test("toJSON", () => {
		let ip = IPAddress.from("127.0.0.1");
		expect(ip.toJSON()).toBe("127.0.0.1");
	});

	test("#valueOf", () => {
		let ip = IPAddress.from("127.0.0.1");
		expect(ip.valueOf()).toBe("127.0.0.1");
	});
});
