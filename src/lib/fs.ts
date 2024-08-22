import type { R2Bucket } from "@cloudflare/workers-types";

export namespace FS {
	export interface File {
		/**
		 * The pathname of the file.
		 */
		pathname: string;
		/**
		 * The content type of the file.
		 */
		contentType: string | undefined;
		/**
		 * The size of the file in bytes.
		 */
		size: number;
		/**
		 * The date the file was uploaded.
		 */
		uploadedAt: Date;
		/**
		 * The metadata stored along the file.
		 */
		meta?: Record<string, string>;
	}

	export namespace List {
		export interface Options {
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
		}

		export interface Result {
			/**
			 * The list of files.
			 */
			files: File[];
			/**
			 * Whether there are more files to fetch.
			 */
			done: boolean;
			/**
			 * An opaque token that indicates where to continue listing objects from.
			 */
			cursor: string | null;
		}
	}

	export namespace Upload {
		export type Pathname = string;

		export type Body =
			| string
			| ReadableStream
			| ArrayBuffer
			| ArrayBufferView
			| Blob;

		export interface Options {
			/**
			 * The content type of the file. If not given, it will be inferred from the Blob or the file extension
			 */
			contentType?: string;
			/**
			 * The content length of the blob..
			 */
			contentLength?: string;
			/**
			 * If `true`, a random suffix will be added to the blob's name.
			 * @default false
			 */
			addRandomSuffix?: boolean;
			/**
			 * The prefix to use for the file pathname
			 */
			prefix?: string;
			/**
			 * An object with custom metadata to store with the blob
			 */
			meta?: Record<string, string>;
		}
	}

	export namespace Serve {
		export type Pathname = string;
	}

	export namespace Head {
		export type Pathname = string;
	}

	export namespace Download {
		export type Pathname = string;
	}

	export namespace Delete {
		export type Pathname = string;
	}
}

/**
 * Upload, store and serve images, videos, music, documents and other
 * unstructured data in your Edge-first application.
 */
export class FS {
	constructor(protected fs: R2Bucket) {}

	async list(options: FS.List.Options = {}): Promise<FS.List.Result> {
		let result = await this.fs.list({
			cursor: options.cursor,
			limit: options.limit ?? 1000,
			prefix: options.prefix,
			delimiter: options.delimiter ?? "/",
		});

		let files = result.objects.map((object) => {
			return {
				pathname: object.key,
				contentType: object.httpMetadata?.contentType,
				size: object.size,
				uploadedAt: object.uploaded,
				meta: object.customMetadata,
			};
		});

		if (result.truncated) {
			return { done: false, files, cursor: result.cursor };
		}

		return { done: true, files, cursor: null };
	}

	async serve(pathname: FS.Serve.Pathname): Promise<Response> {
		throw new Error("Not implemented");
	}

	async head(pathname: FS.Head.Pathname): Promise<FS.File> {
		throw new Error("Not implemented");
	}

	async upload(
		pathname: FS.Upload.Pathname,
		body: FS.Upload.Body,
		options: FS.Upload.Options = {},
	): Promise<FS.File> {
		throw new Error("Not implemented");
	}

	async download(pathname: FS.Download.Pathname): Promise<Blob> {
		throw new Error("Not implemented");
	}

	async delete(...pathname: FS.Delete.Pathname[]): Promise<void> {
		throw new Error("Not implemented");
	}
}
