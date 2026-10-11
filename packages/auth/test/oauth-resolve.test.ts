import { describe, expect, test } from "bun:test";
import { oauthGrantRevocationKey } from "@reloop/auth/middleware/keys";
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

const ISSUED_AT = Math.floor(Date.now() / 1000) - 60;

function verifyOk(payload: Record<string, unknown> = {}) {
	return async () => ({
		sub: "user-1",
		azp: "client-a",
		iat: ISSUED_AT,
		org_id: "org-1",
		exp: Math.floor(Date.now() / 1000) + 3600,
		...payload,
	});
}

const OTHER_JWT = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTIifQ.b3RoZXI";

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
	const member = fakeDb({ id: "user-1", activeOrganizationId: "org-9" }, true);

	test("acts in the org the token is bound to, not the active org", async () => {
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: member as never,
			verify: verifyOk(),
		});
		expect(ctx).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			platformRole: "user",
			authType: "oauth",
		});
	});

	test("refuses tokens that are not bound to an org", async () => {
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: false,
			db: member as never,
			verify: verifyOk({ org_id: undefined }),
		});
		expect(ctx).toBeNull();
	});

	test("refuses tokens without a client or issue time", async () => {
		for (const missing of [{ azp: undefined }, { iat: undefined }]) {
			const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
				requireOrg: true,
				db: member as never,
				verify: verifyOk(missing),
			});
			expect(ctx).toBeNull();
		}
	});

	test("refuses an x-organization-id other than the bound org", async () => {
		const redis = new MemoryRedis();
		const options = {
			requireOrg: true,
			db: member as never,
			verify: verifyOk(),
		};
		expect(
			await resolveOAuthAuth(headers(JWT, "org-2"), deps(redis), options),
		).toBeNull();
		expect(
			(await resolveOAuthAuth(headers(JWT, "org-1"), deps(redis), options))
				?.organizationId,
		).toBe("org-1");
		expect(
			await resolveOAuthAuth(headers(JWT, "org-2"), deps(redis), options),
		).toBeNull();
	});

	test("rejects when the user is not a member of the bound org", async () => {
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: fakeDb({ id: "user-1" }, false) as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("rejects banned users", async () => {
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: fakeDb({ id: "user-1", banned: true }, true) as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("rejects when verification fails", async () => {
		const ctx = await resolveOAuthAuth(headers(JWT), deps(), {
			requireOrg: true,
			db: member as never,
			verify: async () => {
				throw new Error("invalid signature");
			},
		});
		expect(ctx).toBeNull();
	});

	test("caches the verified identity and skips verify on hit", async () => {
		const redis = new MemoryRedis();
		let calls = 0;
		const first = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: member as never,
			verify: async () => {
				calls += 1;
				return verifyOk()();
			},
		});
		const second = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: member as never,
			verify: async () => {
				calls += 1;
				throw new Error("must not be called");
			},
		});
		expect(first?.organizationId).toBe("org-1");
		expect(second?.organizationId).toBe("org-1");
		expect(calls).toBe(1);
	});
});

describe("resolveOAuthAuth grant revocation", () => {
	const db = fakeDb({ id: "user-1" }, true);

	test("rejects tokens issued before the grant was disconnected", async () => {
		const redis = new MemoryRedis();
		await redis.set(
			oauthGrantRevocationKey("user-1", "client-a", "org-1"),
			ISSUED_AT + 1,
		);
		const ctx = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(ctx).toBeNull();
	});

	test("accepts reconnected grants and the same app in another org", async () => {
		const redis = new MemoryRedis();
		await redis.set(
			oauthGrantRevocationKey("user-1", "client-a", "org-1"),
			ISSUED_AT - 1,
		);
		await redis.set(
			oauthGrantRevocationKey("user-1", "client-a", "org-2"),
			ISSUED_AT + 1,
		);
		const reconnected = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(reconnected?.organizationId).toBe("org-1");
		const otherOrg = await resolveOAuthAuth(headers(OTHER_JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk({ org_id: "org-3" }),
		});
		expect(otherOrg?.organizationId).toBe("org-3");
	});

	test("rejects a cached token once its grant is disconnected", async () => {
		const redis = new MemoryRedis();
		const first = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: verifyOk(),
		});
		expect(first).not.toBeNull();
		await redis.set(
			oauthGrantRevocationKey("user-1", "client-a", "org-1"),
			Math.floor(Date.now() / 1000),
		);
		const second = await resolveOAuthAuth(headers(JWT), deps(redis), {
			requireOrg: true,
			db: db as never,
			verify: async () => {
				throw new Error("cache should answer first");
			},
		});
		expect(second).toBeNull();
	});
});
