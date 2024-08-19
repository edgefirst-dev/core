import type { R2Bucket } from "@cloudflare/workers-types";

export namespace FS {
	export interface File {
		pathname: string;
		contentType: string | undefined;
		size: number;
		uploadedAt: Date;
		meta?: Record<string, string>;
	}

	export namespace List {
		export interface Options {
			/**
			 * The maximum number of files to return per request. Defaults to 1000.
			 */
			limit?: number;
			/**
			 * The cursor to continue from a previous list operation
			 */
			cursor?: string;
			/**
			 * If `true`, the list will be folded using `/` separator and list of folders will be returned
			 */
			folded?: boolean;
		}

		export interface Result {
			files: File[];
			done: boolean;
			cursor?: string;
			folders?: string[];
		}
	}

	export namespace Upload {
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
}

export class FS {
	constructor(protected fs: R2Bucket) {}

	async list(
		prefix?: string,
		options: FS.List.Options = {},
	): Promise<FS.List.Result> {
		throw new Error("Not implemented");
	}

	async serve(pathname: string): Promise<Response> {
		throw new Error("Not implemented");
	}

	async head(pathname: string): Promise<FS.File> {
		throw new Error("Not implemented");
	}

	async upload(
		pathname: string,
		body: string | ReadableStream | ArrayBuffer | ArrayBufferView | Blob,
		options: FS.Upload.Options = {},
	): Promise<FS.File> {
		throw new Error("Not implemented");
	}

	async download(pathname: string): Promise<Blob> {
		throw new Error("Not implemented");
	}

	async delete(...pathname: string[]): Promise<void> {
		throw new Error("Not implemented");
	}
}
