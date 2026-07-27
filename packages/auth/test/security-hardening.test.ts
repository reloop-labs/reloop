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

	test("docs profile uses looser CSP", async () => {
		const app = new Elysia()
			.use(secureHeadersPlugin({ profile: "docs", hsts: false }))
			.get("/docs", () => "ok");

		const res = await app.handle(new Request("http://localhost/docs"));
		expect(res.headers.get("Content-Security-Policy")).toBe(
			SECURE_HEADERS_VALUES.cspDocs,
		);
	});
});
