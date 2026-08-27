import { beforeEach, describe, expect, it, mock } from "bun:test";

// RedisCache.set swallows write failures; get returns undefined on error;
// increment rethrows; getRedisClient can hang. Cover those seams plus Redis-up.
type RedisMode = "ok" | "swallow" | "throw" | "hang";

let redisMode: RedisMode = "swallow";
const redisStore = new Map<string, unknown>();

mock.module("@be/tools/utils/loader", () => ({
	redis: {
		set: async (key: string, value: unknown, _seconds?: number) => {
			if (redisMode === "throw") throw new Error("ECONNREFUSED");
			if (redisMode === "hang") return new Promise(() => {});
			if (redisMode === "swallow") return;
			redisStore.set(key, value);
		},
		get: async <T>(key: string): Promise<T | undefined> => {
			if (redisMode === "throw") throw new Error("ECONNREFUSED");
			if (redisMode === "hang") return new Promise(() => {});
			if (redisMode === "swallow") return undefined;
			return (redisStore.get(key) as T) ?? undefined;
		},
		increment: async (_key: string): Promise<number> => {
			if (redisMode === "ok") return 1;
			if (redisMode === "hang") return new Promise(() => {});
			throw new Error("ECONNREFUSED");
		},
		expire: async (_key: string, _seconds: number): Promise<void> => {},
		ttl: async (_key: string): Promise<number> => -1,
		healthCheck: async (): Promise<boolean> => true,
	},
	loader: async () => {},
}));

const { clearMemorySessions, getSession, setSession } = await import(
	"../src/routes/tools/deliverability-test/session-store"
);
const { createDeliverabilityTestSession, getDeliverabilityTestSession } =
	await import(
		"../src/routes/tools/deliverability-test/deliverability-test.controllers"
	);

describe("deliverability session store without Redis", () => {
	beforeEach(() => {
		redisMode = "swallow";
		redisStore.clear();
		clearMemorySessions();
	});

	it("mints and reads a session when Redis set swallows and get misses", async () => {
		const created = await createDeliverabilityTestSession("127.0.0.1");
		expect(created.token).toMatch(/^test-[a-f0-9]+$/);
		expect(created.address).toContain("@");

		const pending = await getDeliverabilityTestSession(created.token);
		expect(pending.status).toBe("pending");
		expect(pending.token).toBe(created.token);
		expect(pending.address).toBe(created.address);
	});

	it("falls back to memory when Redis set/get throw", async () => {
		redisMode = "throw";
		await setSession("deliverability-test:dead", { token: "test-dead" }, 60);
		const stored = await getSession<{ token: string }>(
			"deliverability-test:dead",
		);
		expect(stored?.token).toBe("test-dead");
	});

	it("falls back to memory when Redis set/get hang", async () => {
		redisMode = "hang";
		await setSession("deliverability-test:hang", { token: "test-hang" }, 60);
		const stored = await getSession<{ token: string }>(
			"deliverability-test:hang",
		);
		expect(stored?.token).toBe("test-hang");
	}, 5_000);

	it("prefers Redis when it is up", async () => {
		redisMode = "ok";
		await setSession("deliverability-test:live", { n: 1 }, 60);
		redisStore.set("deliverability-test:live", { n: 2 });
		const stored = await getSession<{ n: number }>("deliverability-test:live");
		expect(stored).toEqual({ n: 2 });
	});

	it("drops expired memory entries", async () => {
		redisMode = "throw";
		await setSession("deliverability-test:old", { token: "gone" }, 0);
		expect(
			await getSession<{ token: string }>("deliverability-test:old"),
		).toBeUndefined();
	});
});
