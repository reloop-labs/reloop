import { beforeEach, describe, expect, mock, test } from "bun:test";

class MemoryRedis {
	private counters = new Map<string, number>();
	private expiries = new Map<string, number>();

	async increment(key: string): Promise<number> {
		const next = (this.counters.get(key) ?? 0) + 1;
		this.counters.set(key, next);
		return next;
	}

	async expire(key: string, seconds: number): Promise<void> {
		this.expiries.set(key, seconds);
	}

	async ttl(key: string): Promise<number> {
		return this.expiries.get(key) ?? -1;
	}

	async healthCheck(): Promise<boolean> {
		return true;
	}

	reset(): void {
		this.counters.clear();
		this.expiries.clear();
	}
}

/** A client that never answers — an unreachable server, not a failing one. */
class HangingRedis {
	async increment(_key: string): Promise<number> {
		return new Promise<never>(() => {});
	}
	async expire(_key: string, _seconds: number): Promise<void> {
		return new Promise<never>(() => {});
	}
	async ttl(_key: string): Promise<number> {
		return new Promise<never>(() => {});
	}
	async healthCheck(): Promise<boolean> {
		return new Promise<never>(() => {});
	}
}

const memoryRedis = new MemoryRedis();
let activeRedis: MemoryRedis | HangingRedis = memoryRedis;

// The exported binding has to be one stable object that forwards on each call.
// Swapping the export itself (or exposing it via a getter) does not work: the
// importing module resolves the binding once, so a later reassignment would be
// invisible and the "unreachable Redis" tests would quietly exercise the
// working fake instead.
const redisDelegate = {
	increment: (key: string) => activeRedis.increment(key),
	expire: (key: string, seconds: number) => activeRedis.expire(key, seconds),
	ttl: (key: string) => activeRedis.ttl(key),
	healthCheck: () => activeRedis.healthCheck(),
};

mock.module("@be/tool/utils/loader", () => ({
	redis: redisDelegate,
	loader: async () => {},
}));

const { Elysia } = await import("elysia");
const { rateLimitPlugin } = await import("../src/middleware/rate-limit");
const { toolConfig } = await import("../src/tool.config");

const { rateLimitMax } = toolConfig.constants;

const app = new Elysia()
	.use(rateLimitPlugin)
	.get("/probe", () => ({ ok: true }), { rateLimit: true });

function probe(ip: string): Promise<Response> {
	return app.handle(
		new Request("http://localhost/probe", {
			headers: { "x-forwarded-for": ip },
		}),
	);
}

beforeEach(() => {
	memoryRedis.reset();
	activeRedis = memoryRedis;
});

describe("per-IP rate limiting", () => {
	test("allows requests up to the limit", async () => {
		for (let i = 0; i < rateLimitMax; i++) {
			const response = await probe("203.0.113.1");
			expect(response.status).toBe(200);
		}
	});

	test("rejects the request past the limit with 429", async () => {
		for (let i = 0; i < rateLimitMax; i++) await probe("203.0.113.2");

		const response = await probe("203.0.113.2");
		expect(response.status).toBe(429);

		const body = (await response.json()) as { message: string; fix?: string };
		expect(body.message).toBe("Too many requests");
		expect(body.fix).toContain("Wait");
	});

	test("counts each IP separately", async () => {
		for (let i = 0; i < rateLimitMax; i++) await probe("203.0.113.3");
		expect((await probe("203.0.113.3")).status).toBe(429);
		expect((await probe("203.0.113.4")).status).toBe(200);
	});

	test("takes the left-most X-Forwarded-For entry", async () => {
		const forwarded = "203.0.113.5, 10.0.0.1";
		for (let i = 0; i < rateLimitMax; i++) await probe(forwarded);
		expect((await probe("203.0.113.5")).status).toBe(429);
	});

	test("advertises limit and remaining on a successful response", async () => {
		const response = await probe("203.0.113.6");
		expect(response.headers.get("ratelimit-limit")).toBe(String(rateLimitMax));
		expect(response.headers.get("ratelimit-remaining")).toBe(
			String(rateLimitMax - 1),
		);
	});

	test("sets retry-after when limited", async () => {
		for (let i = 0; i < rateLimitMax; i++) await probe("203.0.113.7");
		const response = await probe("203.0.113.7");
		expect(response.headers.get("retry-after")).toBeTruthy();
	});
});

describe("when Redis is unreachable", () => {
	test("serves the request instead of hanging on it", async () => {
		activeRedis = new HangingRedis();

		const started = Date.now();
		const response = await probe("203.0.113.8");

		expect(response.status).toBe(200);
		expect(Date.now() - started).toBeLessThan(2_000);
	});

	test("reports a full budget while failing open", async () => {
		activeRedis = new HangingRedis();
		const response = await probe("203.0.113.9");
		expect(response.headers.get("ratelimit-remaining")).toBe(
			String(rateLimitMax),
		);
	});
});
