import { describe, expect, test } from "bun:test";
import {
	type ApiRateLimitRedis,
	apiRateLimitPlugin,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";

function memoryRedis(): ApiRateLimitRedis & { keys: () => string[] } {
	const counts = new Map<string, number>();
	return {
		increment: async (key) => {
			const next = (counts.get(key) ?? 0) + 1;
			counts.set(key, next);
			return next;
		},
		expire: async () => 1,
		ttl: async () => 42,
		keys: () => [...counts.keys()],
	};
}

function app(redis: ApiRateLimitRedis, max = 2) {
	return new Elysia({ prefix: "/api/test" })
		.use(
			apiRateLimitPlugin({
				redis,
				max,
				windowSeconds: 60,
				internalSecret: "s3cret",
			}),
		)
		.get("/private", ({ status }) => status(401, { message: "Auth" }))
		.get("/health", () => "ok");
}

const req = (path: string, headers: Record<string, string> = {}) =>
	new Request(`http://localhost/api/test${path}`, {
		headers: { "x-forwarded-for": "1.2.3.4", ...headers },
	});

describe("apiRateLimitPlugin", () => {
	test("adds headers to 401 and 404 responses", async () => {
		const service = app(memoryRedis(), 10);
		for (const path of ["/private", "/missing"]) {
			const res = await service.handle(req(path));
			expect(res.headers.get("ratelimit-limit")).toBe("10");
			expect(res.headers.get("ratelimit-reset")).toBe("42");
			expect(res.headers.get("ratelimit-remaining")).not.toBeNull();
		}
	});

	test("returns 429 with retry-after once the budget is spent", async () => {
		const service = app(memoryRedis(), 2);
		await service.handle(req("/private"));
		await service.handle(req("/private"));
		const res = await service.handle(req("/private"));
		expect(res.status).toBe(429);
		expect(res.headers.get("retry-after")).toBe("42");
		expect(res.headers.get("ratelimit-remaining")).toBe("0");
		const body = (await res.json()) as Record<string, string>;
		expect(body.message).toBe("Too many requests");
		expect(body.fix).toContain("42");
	});

	test("buckets by API key before IP, without storing the key", async () => {
		const redis = memoryRedis();
		const service = app(redis, 1);
		await service.handle(req("/private", { "x-api-key": "rl_abc" }));
		const res = await service.handle(req("/private"));
		expect(res.status).toBe(401);
		expect(redis.keys().some((k) => k.includes("rl_abc"))).toBe(false);
		expect(redis.keys().some((k) => k.startsWith("rl:api:key:"))).toBe(true);
	});

	test("skips health probes and trusted internal calls", async () => {
		const redis = memoryRedis();
		const service = app(redis, 1);
		const health = await service.handle(req("/health"));
		const internal = await service.handle(
			req("/private", { "x-internal-secret": "s3cret" }),
		);
		expect(health.headers.get("ratelimit-limit")).toBeNull();
		expect(internal.headers.get("ratelimit-limit")).toBeNull();
		expect(redis.keys()).toHaveLength(0);
	});

	test("fails open when Redis errors", async () => {
		const broken: ApiRateLimitRedis = {
			increment: () => Promise.reject(new Error("down")),
			expire: async () => 1,
			ttl: async () => 1,
		};
		const res = await app(broken).handle(req("/private"));
		expect(res.status).toBe(401);
		expect(res.headers.get("ratelimit-limit")).toBeNull();
	});
});
