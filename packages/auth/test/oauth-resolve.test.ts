import { describe, expect, test } from "bun:test";
import {
	extractOAuthToken,
	resolveOAuthAuth,
} from "@reloop/auth/middleware/resolve/resolve-oauth-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import { MemoryRedis } from "./memory-redis";

const JWT = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTEifQ.c2lnbmF0dXJl";
const BASE_URL = "https://reloop.test";

function deps(redis?: MemoryRedis): ResolverDeps {
	return { baseUrl: BASE_URL, redis: redis ?? new MemoryRedis(), ttl: 5 };
}

function headers(token: string | null, org?: string): Headers {
	const request = new Headers();
	if (token) request.set("authorization", `Bearer ${token}`);
	if (org) request.set("x-organization-id", org);
	return request;
}

function fakeDb(
	user: {
		id: string;
		role?: string;
		banned?: boolean | null;
		activeOrganizationId?: string | null;
	},
	isMember: boolean,
) {
	return {
		query: {
			user: {
				findFirst: async () => ({
					id: user.id,
					role: user.role ?? "user",
					banned: user.banned ?? false,
					banExpires: null,
					activeOrganizationId: user.activeOrganizationId ?? null,
				}),
			},
			member: {
				findFirst: async (): Promise<{ id: string } | undefined> =>
					isMember ? { id: "member-1" } : undefined,
			},
		},
	};
}

function verifyOk(payload: Record<string, unknown> = {}) {
	return async () => ({
		sub: "user-1",
		exp: Math.floor(Date.now() / 1000) + 3600,
		...payload,
	});
}

describe("extractOAuthToken", () => {
	test("accepts JWT-shaped bearer tokens", () => {
		expect(extractOAuthToken(headers(JWT))).toBe(JWT);
	});

	test("rejects API keys and garbage", () => {
		expect(
			extractOAuthToken(headers("rl_prod_testkey1234567890abcdefg")),
		).toBeNull();
		expect(extractOAuthToken(headers("nope"))).toBeNull();
		expect(extractOAuthToken(headers(null))).toBeNull();
	});
});

describe("resolveOAuthAuth", () => {
	test("returns an oauth context for a verified member", async () => {
		const db = fakeDb({ id: "user-1", activeOrganizationId: "org-1" }, true);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			platformRole: "user",
			authType: "oauth",
		});
	});

	test("honors a verified x-organization-id override", async () => {
		const db = fakeDb({ id: "user-1", activeOrganizationId: "org-1" }, true);
		const ctx = await resolveOAuthAuth(headers(JWT, "org-2"), deps(), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx?.organizationId).toBe("org-2");
	});

	test("rejects when the user is not a member", async () => {
		const db = fakeDb({ id: "user-1", activeOrganizationId: "org-9" }, false);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("rejects banned users", async () => {
		const db = fakeDb(
			{ id: "user-1", banned: true, activeOrganizationId: "org-1" },
			true,
		);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("rejects when verification fails", async () => {
		const db = fakeDb({ id: "user-1", activeOrganizationId: "org-1" }, true);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: db as never,
			verify: async () => {
				throw new Error("invalid signature");
			},
		});
		expect(ctx).toBeNull();
	});

	test("requires an org when requireOrg is set", async () => {
		const db = fakeDb({ id: "user-1", activeOrganizationId: null }, false);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("caches the verified identity and skips verify on hit", async () => {
		const redis = new MemoryRedis();
		const db = fakeDb({ id: "user-1", activeOrganizationId: "org-1" }, true);
		let calls = 0;
		const first = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: async () => {
				calls += 1;
				return { sub: "user-1", exp: Math.floor(Date.now() / 1000) + 3600 };
			},
		});
		const second = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: async () => {
				calls += 1;
				throw new Error("must not be called");
			},
		});
		expect(first?.authType).toBe("oauth");
		expect(second?.authType).toBe("oauth");
		expect(calls).toBe(1);
	});
});
