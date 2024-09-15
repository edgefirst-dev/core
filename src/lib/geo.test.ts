import { describe, expect, test } from "bun:test";
import type {
	Request as CfRequest,
	RequestInit,
} from "@cloudflare/workers-types";

import { EdgeRequestGeoError } from "./errors.js";
import { Geo } from "./geo.js";

describe(Geo.name, () => {
	let request = new Request("https://example.com") as unknown as CfRequest;

	// @ts-expect-error - cf is not part of the RequestInit type
	request.cf = {
		country: "US",
		region: "CA",
		city: "San Francisco",
		postalCode: "94107",
		latitude: "37.7697",
		longitude: "-122.3933",
		timezone: "America/Los_Angeles",
		metroCode: "807",
		continent: "NA",
		isEUCountry: "1",
	};

	test("#constructor", () => {
		let geo = new Geo(request);
		expect(geo).toBeInstanceOf(Geo);
	});

	test("#constructor throws", () => {
		let request = new Request("https://example.com") as unknown as CfRequest;
		expect(() => new Geo(request)).toThrow(EdgeRequestGeoError);
	});

	test("#country", () => {
		let geo = new Geo(request);
		expect(geo.country).toBe("US");
	});

	test("#region", () => {
		let geo = new Geo(request);
		expect(geo.region).toBe("CA");
	});

	test("#city", () => {
		let geo = new Geo(request);
		expect(geo.city).toBe("San Francisco");
	});

	test("#postalCode", () => {
		let geo = new Geo(request);
		expect(geo.postalCode).toBe("94107");
	});

	test("#latitude", () => {
		let geo = new Geo(request);
		expect(geo.latitude).toBe("37.7697");
	});

	test("#longitude", () => {
		let geo = new Geo(request);
		expect(geo.longitude).toBe("-122.3933");
	});

	test("#timezone", () => {
		let geo = new Geo(request);
		expect(geo.timezone).toBe("America/Los_Angeles");
	});

	test("#metroCode", () => {
		let geo = new Geo(request);
		expect(geo.metroCode).toBe("807");
	});

	test("#continent", () => {
		let geo = new Geo(request);
		expect(geo.continent).toBe("NA");
	});

	test("#isEurope", () => {
		let geo = new Geo(request);
		expect(geo.isEurope).toBe(true);
	});

	test("#toJSON", () => {
		let geo = new Geo(request);

		expect(geo.toJSON()).toEqual({
			country: "US",
			region: "CA",
			city: "San Francisco",
			postalCode: "94107",
			latitude: "37.7697",
			longitude: "-122.3933",
			timezone: "America/Los_Angeles",
			metroCode: "807",
			continent: "NA",
			isEurope: true,
		});
	});

	test("#toString", () => {
		let geo = new Geo(request);

		expect(geo.toString()).toBe(
			JSON.stringify({
				country: "US",
				region: "CA",
				city: "San Francisco",
				postalCode: "94107",
				latitude: "37.7697",
				longitude: "-122.3933",
				timezone: "America/Los_Angeles",
				metroCode: "807",
				continent: "NA",
				isEurope: true,
			}),
		);
	});
});
