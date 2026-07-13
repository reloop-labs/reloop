import type { AuthRedis } from "@reloop/auth/middleware/types";

/**
 * In-memory Redis stand-in for package-level middleware tests.
 * Prefixes keys the same way RedisCache does (`prefix:key`).
 */
export class MemoryRedis implements AuthRedis {
	private store = new Map<string, string>();
	private prefix: string;

	constructor(prefix = "test") {
		this.prefix = prefix;
	}

	private full(key: string): string {
		return `${this.prefix}:${key}`;
	}

	async get<T>(key: string): Promise<T | undefined> {
		const raw = this.store.get(this.full(key));
		if (raw === undefined) return undefined;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return raw as unknown as T;
		}
	}

	async set(key: string, value: unknown, _ttlSeconds?: number): Promise<void> {
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);
		this.store.set(this.full(key), serialized);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(this.full(key));
	}

	/** Test helper: read raw map size / keys without prefix stripping. */
	entries(): [string, string][] {
		return [...this.store.entries()];
	}
}
