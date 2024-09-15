import type {
	ContinentCode,
	Iso3166Alpha2Code,
	Request,
} from "@cloudflare/workers-types";
import { EdgeRequestGeoError } from "./errors.js";

export class Geo {
	constructor(protected request: Request) {
		if (!request.cf) throw new EdgeRequestGeoError();
	}

	get country() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.country as Iso3166Alpha2Code | "T1";
	}

	get region() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.region as string;
	}

	get city() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.city as string;
	}

	get postalCode() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.postalCode as string;
	}

	get latitude() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.latitude as string;
	}

	get longitude() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.longitude as string;
	}

	get timezone() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.timezone as string;
	}

	get metroCode() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.metroCode as string;
	}

	get continent() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.continent as ContinentCode;
	}

	get isEurope() {
		// biome-ignore lint/style/noNonNullAssertion: We checked for cf before
		return this.request.cf!.isEUCountry === "1";
	}

	toJSON() {
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

	toString() {
		return JSON.stringify(this.toJSON());
	}
}
