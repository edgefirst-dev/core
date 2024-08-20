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
		export type Prefix = string;

		export interface Options {
			/**
			 * The maximum number of files to return per request. Defaults to 1000.
			 */
			limit?: number;
			/**
			 * The cursor to continue from a previous list operation
			 */
			cursor?: string;
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
			 * The cursor to use when fetching more files.
			 */
			cursor?: string;
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

	async list(
		prefix?: FS.List.Prefix,
		options: FS.List.Options = {},
	): Promise<FS.List.Result> {
		throw new Error("Not implemented");
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
