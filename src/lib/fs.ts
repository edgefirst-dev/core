import { R2FileStorage } from "@edgefirst-dev/r2-file-storage";
import type { FileUploadHandler } from "@mjackson/form-data-parser";

export namespace FS {
	export namespace Keys {
		export type Options = {
			/**
			 * The prefix to match keys against. Keys will only be returned if they
			 * start with given prefix
			 */
			prefix?: string;
			/**
			 * The number of results to return. Maximum of `1000`.
			 * @default 1000
			 */
			limit?: number;
			/**
			 * An opaque token that indicates where to continue listing objects from.
			 * A cursor can be retrieved from a previous list operation.
			 */
			cursor?: string;
			/**
			 * The character to use when grouping keys.
			 * @default "/"
			 */
			delimiter?: string;
		};

		export type Result =
			| { keys: string[]; done: false; cursor: string }
			| { keys: string[]; done: true; cursor: null };
	}

	export namespace Server {
		export type Init = ResponseInit & {
			/**
			 * The body to use if the file doesn't exist.
			 */
			fallback?: BodyInit | null;
		};
	}

	export namespace UploadHandler {
		export type AllowedFieldNames = string[];
		export type GetKeyFunction = (name: string) => string;
	}
}

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export class FS extends R2FileStorage {
	get binding(): R2Bucket {
		return this.r2;
	}

	/**
	 * Returns a list of all keys in storage.
	 */
	async keys(options: FS.Keys.Options = {}): Promise<FS.Keys.Result> {
		let result = await this.r2.list(options);
		let keys = result.objects.map((object) => object.key);
		if (result.truncated) return { keys, done: false, cursor: result.cursor };
		return { keys, done: true, cursor: null };
	}

	/**
	 * Returns a Response with the file body and correct headers.
	 * If the file doesn't exits it returns a 404 response with an empty body.
	 * @param key The key of the file to serve
	 * @param init The response init object, with an optional fallback body
	 */
	async serve(
		key: string,
		{ fallback, ...init }: FS.Server.Init = {},
	): Promise<Response> {
		let object = await this.r2.get(key);

		if (!object) {
			return new Response(fallback ?? null, { ...init, status: 404 });
		}

		let headers = new Headers(init?.headers);

		// This may throw, we don't want to break the response
		try {
			object.writeHttpMetadata(headers);
			// biome-ignore lint/suspicious/noEmptyBlockStatements: We don't need to do anything here
		} catch {}

		return new Response(await object.arrayBuffer(), { headers });
	}

	/**
	 * Create a new FileUploadHandler function that will automatically upload
	 * files to the File Storage.
	 *
	 * The handle will only upload files if they match a list of valid input
	 * field name. The key used to store the file can be customized with a
	 * `getKey` function.
	 * @param allowedFieldNames The form field names allowed to upload files.
	 * @param getKey A function that returns the key usd to store the file in the file system.
	 * @returns A file upload handler function that can be used with the parseFormData.
	 */
	uploadHandler(
		allowedFieldNames: FS.UploadHandler.AllowedFieldNames,
		getKey?: FS.UploadHandler.GetKeyFunction,
	): FileUploadHandler {
		return async (fileUpload) => {
			if (!fileUpload.fieldName) return;
			if (!allowedFieldNames.includes(fileUpload.fieldName)) return;

			let key = getKey ? getKey(fileUpload.name) : crypto.randomUUID();

			let file = new File([await fileUpload.arrayBuffer()], key, {
				type: fileUpload.type,
			});

			await this.set(key, file);

			return file;
		};
	}
}
