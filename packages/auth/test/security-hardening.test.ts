import { describe, expect, test } from "bun:test";
import {
	API_KEY_MAX_LENGTH,
	API_KEY_MIN_LENGTH,
	generateApiKey,
	isPlausibleApiKeyShape,
} from "@reloop/auth/apikey/helpers";
import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	isInsecureDefaultInternalSecret,
	KNOWN_INSECURE_INTERNAL_SECRETS,
	sanitizeInternalSecret,
} from "@reloop/auth/middleware/internal-secret";
import {
	buildRateLimitHeaders,
	buildReloopQuotaHeaders,
	RATE_LIMIT_HEADER,
	RELOOP_QUOTA_HEADER,
} from "@reloop/auth/middleware/rate-limit-headers";
import { requireUserAgentPlugin } from "@reloop/auth/middleware/require-user-agent";
import { extractApiKey } from "@reloop/auth/middleware/resolve/extract-api-key";
import {
	resolveInternalAuth,
	timingSafeStringEqual,
} from "@reloop/auth/middleware/resolve/resolve-internal-auth";
import {
	SECURE_HEADERS_VALUES,
	secureHeadersPlugin,
} from "@reloop/auth/middleware/secure-headers";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";
import { Elysia } from "elysia";

describe("API key header bounds", () => {
	test("generated keys pass the plausible-shape gate", () => {
		const key = generateApiKey();
		expect(isPlausibleApiKeyShape(key)).toBe(true);
		expect(key.length).toBeGreaterThanOrEqual(API_KEY_MIN_LENGTH);
		expect(key.length).toBeLessThanOrEqual(API_KEY_MAX_LENGTH);
	});

	test("isPlausibleApiKeyShape rejects oversize and undersize", () => {
		expect(isPlausibleApiKeyShape("short")).toBe(false);
		expect(isPlausibleApiKeyShape(`x_${"a".repeat(API_KEY_MAX_LENGTH)}`)).toBe(
			false,
		);
		expect(isPlausibleApiKeyShape("has spaces and!!")).toBe(false);
	});

	test("extractApiKey returns null for oversize x-api-key", () => {
		const huge = "a".repeat(API_KEY_MAX_LENGTH + 1);
		const headers = new Headers({ "x-api-key": huge });
		expect(extractApiKey(headers)).toBeNull();
	});

	test("extractApiKey trims and accepts Bearer", () => {
		const key = generateApiKey();
		expect(extractApiKey(new Headers({ "x-api-key": `  ${key}  ` }))).toBe(key);
		expect(extractApiKey(new Headers({ authorization: `Bearer ${key}` }))).toBe(
			key,
		);
	});

	test("validateApiKey never looks up oversize keys", async () => {
		const huge = `rl_prod_${"a".repeat(API_KEY_MAX_LENGTH)}`;
		let dbCalled = false;
		const redis = {
			async get<T>(): Promise<T | undefined> {
				return undefined;
			},
			async set(): Promise<void> {},
			async delete(): Promise<void> {},
		};
		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => {
						dbCalled = true;
						return undefined;
					},
				},
			},
		};

		await expect(
			validateApiKey(huge, redis, fakeDb as never),
		).resolves.toBeNull();
		expect(dbCalled).toBe(false);
	});
});

describe("internal secret hardening", () => {
	test("timingSafeStringEqual matches equal strings", () => {
		expect(timingSafeStringEqual("abc", "abc")).toBe(true);
		expect(timingSafeStringEqual("abc", "abd")).toBe(false);
		expect(timingSafeStringEqual("abc", "ab")).toBe(false);
	});

	test("sanitizeInternalSecret drops known defaults in production", () => {
		const def = KNOWN_INSECURE_INTERNAL_SECRETS[0];
		expect(isInsecureDefaultInternalSecret(def)).toBe(true);
		expect(sanitizeInternalSecret(def, "production")).toBeUndefined();
		expect(sanitizeInternalSecret(def, "development")).toBe(def);
		expect(sanitizeInternalSecret("good-unique-secret", "production")).toBe(
			"good-unique-secret",
		);
	});

	test("resolveInternalAuth rejects wrong secret", () => {
		const headers = new Headers({
			[INTERNAL_SECRET_HEADER]: "wrong",
			[INTERNAL_USER_ID_HEADER]: "u1",
			[INTERNAL_ORG_ID_HEADER]: "o1",
		});
		expect(
			resolveInternalAuth(headers, { internalSecret: "right-secret-value" }),
		).toBeNull();
	});

	test("resolveInternalAuth accepts correct secret", () => {
		const secret = "right-secret-value-32chars-ok!!";
		const headers = new Headers({
			[INTERNAL_SECRET_HEADER]: secret,
			[INTERNAL_USER_ID_HEADER]: "u1",
			[INTERNAL_ORG_ID_HEADER]: "o1",
		});
		expect(resolveInternalAuth(headers, { internalSecret: secret })).toEqual({
			userId: "u1",
			organizationId: "o1",
			platformRole: null,
			authType: "internal",
		});
	});
});

describe("secureHeadersPlugin", () => {
	test("api profile sets baseline headers without HSTS in non-production", async () => {
		const app = new Elysia()
			.use(secureHeadersPlugin({ profile: "api", nodeEnv: "test" }))
			.get("/ping", () => ({ ok: true }));

		const res = await app.handle(new Request("http://localhost/ping"));
		expect(res.status).toBe(200);
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
		expect(res.headers.get("X-Frame-Options")).toBe("DENY");
		expect(res.headers.get("Referrer-Policy")).toBe(
			SECURE_HEADERS_VALUES.referrer,
		);
		expect(res.headers.get("Permissions-Policy")).toBe(
			SECURE_HEADERS_VALUES.permissions,
		);
		expect(res.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspApi,
		);
		expect(res.headers.get("Strict-Transport-Security")).toBeNull();
	});

	test("production enables HSTS", async () => {
		const app = new Elysia()
			.use(secureHeadersPlugin({ profile: "api", nodeEnv: "production" }))
			.get("/ping", () => "ok");

		const res = await app.handle(new Request("http://localhost/ping"));
		expect(res.headers.get("Strict-Transport-Security")).toBe(
			SECURE_HEADERS_VALUES.hsts,
		);
	});

	test("docs profile uses looser CSP on every path", async () => {
		const app = new Elysia()
			.use(secureHeadersPlugin({ profile: "docs", hsts: false }))
			.get("/docs", () => "ok");

		const res = await app.handle(new Request("http://localhost/docs"));
		expect(res.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspDocs,
		);
	});

	test("api profile uses docs CSP on OpenAPI HTML paths", async () => {
		const app = new Elysia({ prefix: "/api/workflow" })
			.use(secureHeadersPlugin({ profile: "api", nodeEnv: "test" }))
			.get(
				"/openapi",
				() =>
					new Response("<html></html>", {
						headers: { "content-type": "text/html" },
					}),
			)
			.get("/openapi/json", () => ({ openapi: "3.0.0" }))
			.get("/v1/jobs", () => ({ ok: true }));

		const ui = await app.handle(
			new Request("http://localhost/api/workflow/openapi"),
		);
		expect(ui.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspDocs,
		);
		expect(ui.headers.get("Content-Security-Policy")).toContain(
			"cdn.jsdelivr.net",
		);
		expect(ui.headers.get("Content-Security-Policy")).toContain(
			"fonts.googleapis.com",
		);

		const spec = await app.handle(
			new Request("http://localhost/api/workflow/openapi/json"),
		);
		expect(spec.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspApi,
		);

		const api = await app.handle(
			new Request("http://localhost/api/workflow/v1/jobs"),
		);
		expect(api.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspApi,
		);
	});

	test("sets CSP once (no stacked duplicate policies)", async () => {
		const app = new Elysia()
			.use(secureHeadersPlugin({ profile: "api", nodeEnv: "test" }))
			.get("/openapi", () => "ok");

		const res = await app.handle(new Request("http://localhost/openapi"));
		const csp = res.headers.get("Content-Security-Policy");
		expect(csp).toBe(SECURE_HEADERS_VALUES.cspDocs);
		// getSetCookie-style multi-value: Headers.get joins with ", " if
		// multiple values were appended — a duplicated policy would contain
		// "default-src" twice or the full policy string twice.
		expect(csp?.split("default-src").length).toBe(2); // one directive + split left
	});
});

describe("requireUserAgentPlugin", () => {
	test("rejects API calls without User-Agent", async () => {
		const app = new Elysia()
			.use(requireUserAgentPlugin())
			.get("/v1/keys", () => ({ ok: true }));

		const res = await app.handle(new Request("http://localhost/v1/keys"));
		expect(res.status).toBe(400);
		const body = (await res.json()) as { message: string };
		expect(body.message).toContain("User-Agent");
	});

	test("allows calls with User-Agent", async () => {
		const app = new Elysia()
			.use(requireUserAgentPlugin())
			.get("/v1/keys", () => ({ ok: true }));

		const res = await app.handle(
			new Request("http://localhost/v1/keys", {
				headers: { "user-agent": "ReloopSDK/1.0" },
			}),
		);
		expect(res.status).toBe(200);
	});

	test("allows health without User-Agent", async () => {
		const app = new Elysia()
			.use(requireUserAgentPlugin())
			.get("/api/api-key/health", () => ({ ok: true }));

		const res = await app.handle(
			new Request("http://localhost/api/api-key/health"),
		);
		expect(res.status).toBe(200);
	});
});

describe("rate limit + reloop quota headers", () => {
	test("buildRateLimitHeaders uses Resend-style names and seconds reset", () => {
		const h = buildRateLimitHeaders({
			limit: 100,
			remaining: 42,
			resetSeconds: 17,
			retryAfter: 17,
		});
		expect(h[RATE_LIMIT_HEADER.limit]).toBe("100");
		expect(h[RATE_LIMIT_HEADER.remaining]).toBe("42");
		expect(h[RATE_LIMIT_HEADER.reset]).toBe("17");
		expect(h[RATE_LIMIT_HEADER.retryAfter]).toBe("17");
		expect(h["Retry-After"]).toBe("17");
	});

	test("buildReloopQuotaHeaders exposes used daily/monthly counts", () => {
		const h = buildReloopQuotaHeaders({
			dailyUsed: 12,
			monthlyUsed: 340,
		});
		expect(h[RELOOP_QUOTA_HEADER.daily]).toBe("12");
		expect(h[RELOOP_QUOTA_HEADER.monthly]).toBe("340");
	});
});
