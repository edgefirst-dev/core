import type { Jsonifiable } from "type-fest";

export namespace Session {
	export type Data = Record<string, Jsonifiable>;

	export namespace Flash {
		export type Key<K extends string> = `__flash_${K}__`;

		export type Data<D, F> = Partial<
			D & {
				[K in keyof F as Key<K & string>]: F[K];
			}
		>;
	}
}

export class Session<
	Data extends Session.Data,
	Flash extends Session.Data = Data,
> {
	#isDirty = false;
	#id: string;
	#data: Map<keyof Data | Session.Flash.Key<keyof Flash & string>, Jsonifiable>;

	constructor(id: string, data: Partial<Data>) {
		this.#id = id;
		this.#data = new Map(Object.entries(data));
	}

	/**
	 * Get the unique identifier of the session.
	 */
	get id() {
		return this.#id;
	}

	/**
	 * Get a copy of the raw data stored in the session.
	 *
	 * This is a shallow copy, so modifying the returned object will not affect
	 * the session.
	 */
	get data() {
		return Object.fromEntries(this.#data.entries()) as Session.Flash.Data<
			Data,
			Flash
		>;
	}

	/**
	 * Check if the session has been modified since it was created or last saved.
	 */
	get isDirty() {
		return this.#isDirty;
	}

	/**
	 * Check if the session has a value for a given key.
	 */
	has(key: (keyof Data | keyof Flash) & string) {
		return this.#data.has(key) || this.#data.has(this.flashKey(key as string));
	}

	/**
	 * Set a value in the session data.
	 * @param key The key of the data to set
	 * @param value The value to set
	 */
	set<K extends keyof Data>(key: K, value: Data[K]) {
		this.#data.set(key, value);
		this.#isDirty = true;
	}

	/**
	 * Get a value from the session data.
	 * @param key The key of the data to get
	 */
	get<K extends (keyof Data | keyof Flash) & string>(
		key: K,
	): K extends keyof Flash
		? Flash[K]
		: K extends keyof Data
			? Data[K]
			: undefined {
		if (this.#data.has(key as keyof Data)) {
			let value = this.#data.get(key as keyof Data) as Data[typeof key];
			return value as K extends keyof Flash
				? Flash[K]
				: K extends keyof Data
					? Data[K]
					: undefined;
		}

		let flashkey = this.flashKey(key as keyof Flash & string);

		if (this.#data.has(flashkey)) {
			let value = this.#data.get(flashkey) as Flash[typeof key] | undefined;
			this.#data.delete(flashkey);
			return value as K extends keyof Flash
				? Flash[K]
				: K extends keyof Data
					? Data[K]
					: undefined;
		}

		return undefined as K extends keyof Flash
			? Flash[K]
			: K extends keyof Data
				? Data[K]
				: undefined;
	}

	/**
	 * Delete a value from the session data.
	 * @param key The key of the data to delete
	 */
	unset<K extends keyof Data>(key: K) {
		this.#data.delete(key);
		this.#isDirty = true;
	}

	/**
	 * Set a value in the session data and mark it as flash data.
	 * @param key The key of the data to flash
	 * @param value The value to store in the flash data
	 */
	flash<K extends keyof Flash & string>(key: K, value: Flash[K]) {
		this.#data.set(this.flashKey(key), value);
		this.#isDirty = true;
	}

	private flashKey<K extends keyof Data>(key: K) {
		return `__flash_${String(key)}__` as Session.Flash.Key<K & string>;
	}
}

export interface SessionStorage<
	Data extends Session.Data,
	Flash extends Session.Data,
> {
	read(id?: string): Promise<Session<Data, Flash>>;
	save(session: Session<Data, Flash>): Promise<void>;
	destroy(session: Session<Data, Flash>): Promise<void>;
}

export class WorkerKVSessionStorage<
	Data extends Session.Data,
	Flash extends Session.Data,
> implements SessionStorage<Data, Flash>
{
	private prefix = "session";

	constructor(private kv: KVNamespace) {}

	async read(id = crypto.randomUUID()) {
		let key = this.getPrefixedKey(id);
		let data = await this.kv.get<Data & Flash>(key, { type: "json" });
		return new Session<Data, Flash>(id, data ?? {});
	}

	async save(session: Session<Data, Flash>) {
		let key = this.getPrefixedKey(session.id);
		await this.kv.put(key, JSON.stringify(session.data));
	}

	async destroy(session: Session<Data, Flash>) {
		let key = this.getPrefixedKey(session.id);
		await this.kv.delete(key);
	}

	private getPrefixedKey(id: string) {
		return `${this.prefix}:${id}`;
	}
}
