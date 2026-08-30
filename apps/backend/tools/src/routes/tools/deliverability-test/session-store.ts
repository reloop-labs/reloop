import { withDeadline } from "@be/tools/utils/deadline";
import { redis } from "@be/tools/utils/loader";
import { log } from "evlog";

// Match the rate-limiter deadline. The Redis client reconnects forever rather
// than rejecting, so a bare await hangs and a try/catch never fires.
const REDIS_OP_DEADLINE_MS = 250;
const MAX_MEMORY_SESSIONS = 256;

type MemoryEntry<T> = {
	value: T;
	expiresAt: number;
};

const memory = new Map<string, MemoryEntry<unknown>>();
const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearExpiryTimer(key: string): void {
	const timer = expiryTimers.get(key);
	if (timer) {
		clearTimeout(timer);
		expiryTimers.delete(key);
	}
}

function evictOverflow(): void {
	while (memory.size > MAX_MEMORY_SESSIONS) {
		const oldest = memory.keys().next().value;
		if (typeof oldest !== "string") break;
		clearExpiryTimer(oldest);
		memory.delete(oldest);
	}
}

function memorySet<T>(key: string, value: T, ttlSeconds: number): void {
	clearExpiryTimer(key);
	const ttlMs = Math.max(0, ttlSeconds) * 1000;
	memory.set(key, {
		value,
		expiresAt: Date.now() + ttlMs,
	});
	evictOverflow();
	if (ttlMs <= 0) {
		memory.delete(key);
		return;
	}
	const timer = setTimeout(() => {
		const entry = memory.get(key);
		if (entry && Date.now() >= entry.expiresAt) memory.delete(key);
		expiryTimers.delete(key);
	}, ttlMs);
	timer.unref?.();
	expiryTimers.set(key, timer);
}

function memoryGet<T>(key: string): T | undefined {
	const entry = memory.get(key);
	if (!entry) return undefined;
	if (Date.now() >= entry.expiresAt) {
		clearExpiryTimer(key);
		memory.delete(key);
		return undefined;
	}
	return entry.value as T;
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Redis is the primary session store. RedisCache.set swallows write failures
 * and getRedisClient can hang, so every write also lands in a process-local
 * Map with the same TTL. Local preview without Docker can mint a test address.
 */
export async function setSession<T>(
	key: string,
	value: T,
	ttlSeconds: number,
): Promise<void> {
	try {
		await withDeadline(
			redis.set(key, value, ttlSeconds),
			REDIS_OP_DEADLINE_MS,
			"Redis set",
		);
	} catch (error) {
		log.warn(
			"DeliverabilityTest",
			`Redis session write failed (${errorMessage(error)}); using in-memory store`,
		);
	}
	memorySet(key, value, ttlSeconds);
}

export async function getSession<T>(key: string): Promise<T | undefined> {
	try {
		const value = await withDeadline(
			redis.get<T>(key),
			REDIS_OP_DEADLINE_MS,
			"Redis get",
		);
		if (value != null) return value;
	} catch (error) {
		log.warn(
			"DeliverabilityTest",
			`Redis session read failed (${errorMessage(error)}); using in-memory store`,
		);
	}
	return memoryGet<T>(key);
}

export function clearMemorySessions(): void {
	for (const key of expiryTimers.keys()) clearExpiryTimer(key);
	memory.clear();
}
