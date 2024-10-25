import type {
	ContinentCode,
	Iso3166Alpha2Code,
	Request,
} from "@cloudflare/workers-types";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { EdgeRequestGeoError } from "../errors.js";

/**
 * Entity that represents the geographical information of the client's request.
 * This information is provided by Cloudflare Workers and is accessible through
 * the `request.cf` object.
 *
 * @example
 * import { geo } from "@edgefirst/core";
 * geo().timezone; // "America/New_York"
 */
export class Geo extends Data<ObjectParser> {
	constructor(protected request: Request) {
		if (!request.cf) throw new EdgeRequestGeoError();
		super(new ObjectParser(request.cf));
	}

	get country() {
		return this.parser.string("country") as Iso3166Alpha2Code | "T1";
	}

	get region() {
		return this.parser.string("region");
	}

	get city() {
		return this.parser.string("city");
	}

	get postalCode() {
		return this.parser.string("postalCode");
	}

	get latitude() {
		return this.parser.string("latitude");
	}

	get longitude() {
		return this.parser.string("longitude");
	}

	get timezone() {
		return this.parser.string("timezone");
	}

	get metroCode() {
		return this.parser.string("metroCode");
	}

	get continent() {
		return this.parser.string("continent") as ContinentCode;
	}

	get isEurope() {
		return this.parser.string("isEUCountry") === "1";
	}

	override toJSON() {
		return {
			country: this.country,
			region: this.region,
			city: this.city,
			postalCode: this.postalCode,
			latitude: this.latitude,
			longitude: this.longitude,
			timezone: this.timezone,
			metroCode: this.metroCode,
			continent: this.continent,
			isEurope: this.isEurope,
		};
	}

	override toString() {
		return JSON.stringify(this.toJSON());
	}
}
