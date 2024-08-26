import type {
	ContinentCode,
	Iso3166Alpha2Code,
} from "@cloudflare/workers-types";
import { EdgeRequestGeoError } from "./errors.js";

export class Geo {
	constructor(protected request: Request) {
		if (!request.cf) throw new EdgeRequestGeoError();
	}

	get country() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.country as Iso3166Alpha2Code | "T1";
	}

	get region() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.region as string;
	}

	get city() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.city as string;
	}

	get postalCode() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.postalCode as string;
	}

	get latitude() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.latitude as string;
	}

	get longitude() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.longitude as string;
	}

	get timezone() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.timezone as string;
	}

	get metroCode() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.metroCode as string;
	}

	get continent() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.continent as ContinentCode;
	}

	get isEurope() {
		if (!this.request.cf) throw new EdgeRequestGeoError();
		return this.request.cf.isEUCountry === "1";
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
