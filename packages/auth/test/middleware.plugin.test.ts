import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { randomBytes } from "node:crypto";
import { Elysia } from "elysia";
import {
	API_KEY_PREFIX,
	getApiKeyCacheKey,
	hashApiKey,
} from "@reloop/auth/apikey/helpers";
import {
	type AuthContext,
	createAuthPlugin,
	resolveApiKeyInternalOrSession,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "@reloop/auth/middleware";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { MemoryRedis } from "./memory-redis";

type FakeSession = {
	userId: string;
	role?: string | null;
	email?: string;
	name?: string;
	image?: string;
	activeOrganizationId?: string | null;
	status?: number;
};

const sessions = new Map<string, FakeSession>();
let fakeAuth: ReturnType<Elysia["listen"]> | null = null;
let baseUrl = "";
let getSessionHits = 0;

function cookieFor(token: string): string {
	return `reloop.session_token=${token}.fakesig`;
}

function mountApp(
	redis: MemoryRedis,
	opts: { internalSecret?: string } = {},
) {
	const plugin = createAuthPlugin({
		baseUrl,
		redis,
		ttl: 5,
		internalSecret: opts.internalSecret,
	});
	return new Elysia()
		.use(plugin)
		.get(
			"/auth",
			({ userId, organizationId, platformRole, authType, apiKeyId }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
				...(apiKeyId ? { apiKeyId } : {}),
			}),
			{ auth: true },
		)
		.get(
			"/auth-no-org",
			({ userId, organizationId, platformRole, authType }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
			}),
			{ authNoOrg: true },
		)
		.get(
			"/auth-key",
			({ userId, organizationId, platformRole, authType, apiKeyId }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
				apiKeyId,
			}),
			{ authKey: true },
		)
		.get(
			"/auth-admin",
			({ userId, organizationId, platformRole, authType }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
			}),
			{ authAdmin: true },
		)
		.get(
			"/auth-internal",
			({ userId, organizationId, platformRole, authType }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
			}),
			{ authInternal: true },
		)
		.get(
			"/auth-key-internal",
			({ userId, organizationId, platformRole, authType, apiKeyId }) => ({
				userId,
				organizationId,
				platformRole,
				authType,
				...(apiKeyId ? { apiKeyId } : {}),
			}),
			{ authKeyInternal: true },
		)
		.get(
			"/auth-support",
			({
				userId,
				organizationId,
				platformRole,
				authType,
				isPlatformAdmin,
				userEmail,
			}) => ({
				userId,
				organizationId,
				platformRole,
				authType,
				isPlatformAdmin,
				userEmail,
			}),
			{ authSupport: true },
		)
		.get(
			"/auth-collab",
			({
				userId,
				organizationId,
				platformRole,
				authType,
				userEmail,
				userName,
				userImage,
				apiKeyId,
			}) => ({
				userId,
				organizationId,
				platformRole,
				authType,
				userEmail,
				userName,
				userImage,
				...(apiKeyId ? { apiKeyId } : {}),
			}),
			{ authCollab: true },
		);
}

beforeAll(async () => {
	const app = new Elysia().get(
		"/api/auth/v1/get-session",
		({ request, set }) => {
			getSessionHits += 1;
			const cookie = request.headers.get("cookie") ?? "";
			const match = cookie.match(/reloop\.session_token=([^.;]+)/);
			const token = match?.[1] ? decodeURIComponent(match[1]) : null;
			if (!token) {
				set.status = 200;
				return null;
			}
			const session = sessions.get(token);
			if (!session) {
				set.status = 200;
				return null;
			}
			if (session.status && session.status !== 200) {
				set.status = session.status;
				return { error: "upstream" };
			}
			return {
				user: {
					id: session.userId,
					role: session.role ?? "user",
					email: session.email ?? "u@example.com",
					name: session.name ?? "User",
					image: session.image ?? null,
					activeOrganizationId: session.activeOrganizationId ?? null,
				},
			};
		},
	);

	fakeAuth = app.listen(0);
	const port = fakeAuth.server?.port;
	if (!port) throw new Error("fake auth server failed to bind");
	baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(() => {
	fakeAuth?.stop();
});

beforeEach(() => {
	sessions.clear();
	getSessionHits = 0;
});

function makeRawKey(): string {
	const randomPart = randomBytes(20).toString("base64url");
	return `${API_KEY_PREFIX}_${randomPart}`;
}

describe("createAuthPlugin — session macros", () => {
	test("auth: valid session with org returns 200 + AuthContext", async () => {
		const redis = new MemoryRedis();
		const token = "tok-valid-org";
		sessions.set(token, {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			platformRole: "user",
			authType: "session",
		});
	});

	test("auth: fail-closed when session has no active organization", async () => {
		const redis = new MemoryRedis();
		const token = "tok-no-org";
		sessions.set(token, {
			userId: "user-1",
			role: "user",
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(401);
	});

	test("authNoOrg: allows session without organization", async () => {
		const redis = new MemoryRedis();
		const token = "tok-no-org-ok";
		sessions.set(token, {
			userId: "user-2",
			role: "user",
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-no-org", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.userId).toBe("user-2");
		expect(body.organizationId).toBeNull();
		expect(body.authType).toBe("session");
		expect(body.platformRole).toBe("user");
	});

	test("auth: absent session returns 401", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth"),
		);
		expect(res.status).toBe(401);
	});

	test("auth: non-OK get-session status is not trusted", async () => {
		const redis = new MemoryRedis();
		const token = "tok-500";
		sessions.set(token, {
			userId: "user-x",
			activeOrganizationId: "org-x",
			status: 500,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth", {
				headers: { cookie: cookieFor(token) },
			}),
		);
		expect(res.status).toBe(401);
	});

	test("session results are cached by session token + user index", async () => {
		const redis = new MemoryRedis();
		const token = "tok-cache";
		sessions.set(token, {
			userId: "user-c",
			role: "user",
			activeOrganizationId: "org-c",
		});

		const app = mountApp(redis);
		const req = () =>
			app.handle(
				new Request("http://localhost/auth", {
					headers: { cookie: cookieFor(token) },
				}),
			);

		expect((await req()).status).toBe(200);
		const hitsAfterFirst = getSessionHits;
		sessions.set(token, {
			userId: "user-c",
			role: "user",
			activeOrganizationId: null,
		});
		const second = await req();
		expect(second.status).toBe(200);
		expect(getSessionHits).toBe(hitsAfterFirst);
		const body = (await second.json()) as AuthContext;
		expect(body.organizationId).toBe("org-c");
		expect(body.platformRole).toBe("user");

		const cached = await redis.get<AuthContext>(sessionTokenCacheKey(token));
		expect(cached?.userId).toBe("user-c");
		expect(cached?.platformRole).toBe("user");

		const index = await redis.get<string[]>(sessionUserIndexKey("user-c"));
		expect(index).toContain(token);
	});
});

describe("createAuthPlugin — authAdmin", () => {
	test("authAdmin: allows super-admin without org", async () => {
		const redis = new MemoryRedis();
		const token = "tok-admin";
		sessions.set(token, {
			userId: "admin-1",
			role: PLATFORM_ADMIN_ROLE,
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-admin", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.platformRole).toBe(PLATFORM_ADMIN_ROLE);
		expect(body.authType).toBe("session");
	});

	test("authAdmin: rejects non-admin role", async () => {
		const redis = new MemoryRedis();
		const token = "tok-not-admin";
		sessions.set(token, {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-admin", {
				headers: { cookie: cookieFor(token) },
			}),
		);
		expect(res.status).toBe(401);
	});
});

describe("createAuthPlugin — authKey", () => {
	test("authKey: valid cached key returns apikey AuthContext", async () => {
		const redis = new MemoryRedis();
		const raw = makeRawKey();
		const hashed = hashApiKey(raw);
		await redis.set(getApiKeyCacheKey(hashed), {
			userId: "key-user",
			organizationId: "key-org",
			apiKeyId: "key-id-1",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-key", {
				headers: { "x-api-key": raw },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body).toEqual({
			userId: "key-user",
			organizationId: "key-org",
			platformRole: null,
			authType: "apikey",
			apiKeyId: "key-id-1",
		});
	});

	test("authKey: missing key returns 401", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-key"),
		);
		expect(res.status).toBe(401);
	});

	test("auth: prefers API key over session when both present", async () => {
		const redis = new MemoryRedis();
		const raw = makeRawKey();
		const hashed = hashApiKey(raw);
		await redis.set(getApiKeyCacheKey(hashed), {
			userId: "key-user",
			organizationId: "key-org",
			apiKeyId: "key-id-2",
		});
		const token = "tok-also";
		sessions.set(token, {
			userId: "session-user",
			activeOrganizationId: "session-org",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth", {
				headers: {
					"x-api-key": raw,
					cookie: cookieFor(token),
				},
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.authType).toBe("apikey");
		expect(body.userId).toBe("key-user");
	});

	test("auth: invalid API key does not fall through to session", async () => {
		const redis = new MemoryRedis();
		const token = "tok-session";
		sessions.set(token, {
			userId: "session-user",
			activeOrganizationId: "session-org",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth", {
				headers: {
					"x-api-key": "rl_prod_notvalidkey!!!!!!!!!!",
					cookie: cookieFor(token),
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});

describe("createAuthPlugin — internal", () => {
	const secret = "test-internal-secret";

	test("authInternal: valid headers return authType internal", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis, { internalSecret: secret }).handle(
			new Request("http://localhost/auth-internal", {
				headers: {
					"x-internal-secret": secret,
					"x-user-id": "svc-user",
					"x-organization-id": "org-int",
				},
			}),
		);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			userId: "svc-user",
			organizationId: "org-int",
			platformRole: null,
			authType: "internal",
		});
	});

	test("authInternal: missing user id fails closed", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis, { internalSecret: secret }).handle(
			new Request("http://localhost/auth-internal", {
				headers: {
					"x-internal-secret": secret,
					"x-organization-id": "org-int",
				},
			}),
		);
		expect(res.status).toBe(401);
	});

	test("authInternal: without plugin secret fails closed", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-internal", {
				headers: {
					"x-internal-secret": secret,
					"x-user-id": "svc-user",
					"x-organization-id": "org-int",
				},
			}),
		);
		expect(res.status).toBe(401);
	});

	test("auth does not accept internal even when secret configured", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis, { internalSecret: secret }).handle(
			new Request("http://localhost/auth", {
				headers: {
					"x-internal-secret": secret,
					"x-user-id": "svc-user",
					"x-organization-id": "org-int",
				},
			}),
		);
		expect(res.status).toBe(401);
	});

	test("authKeyInternal: API key wins over internal", async () => {
		const redis = new MemoryRedis();
		const raw = makeRawKey();
		await redis.set(getApiKeyCacheKey(hashApiKey(raw)), {
			userId: "key-user",
			organizationId: "key-org",
			apiKeyId: "k1",
		});

		const res = await mountApp(redis, { internalSecret: secret }).handle(
			new Request("http://localhost/auth-key-internal", {
				headers: {
					"x-api-key": raw,
					"x-internal-secret": secret,
					"x-user-id": "svc-user",
					"x-organization-id": "org-int",
				},
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.authType).toBe("apikey");
		expect(body.userId).toBe("key-user");
	});

	test("authKeyInternal: falls through to internal when no key header", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis, { internalSecret: secret }).handle(
			new Request("http://localhost/auth-key-internal", {
				headers: {
					"x-internal-secret": secret,
					"x-user-id": "svc-user",
					"x-organization-id": "org-int",
				},
			}),
		);

		expect(res.status).toBe(200);
		expect((await res.json()).authType).toBe("internal");
	});
});

describe("createAuthPlugin — authSupport / authCollab", () => {
	test("authSupport: any user, isPlatformAdmin false + profile on miss", async () => {
		const redis = new MemoryRedis();
		const token = "tok-support";
		sessions.set(token, {
			userId: "user-s",
			role: "user",
			email: "s@example.com",
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-support", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			isPlatformAdmin: boolean;
			userEmail?: string;
			platformRole: string;
		};
		expect(body.isPlatformAdmin).toBe(false);
		expect(body.platformRole).toBe("user");
		expect(body.userEmail).toBe("s@example.com");
	});

	test("authSupport: cache hit skips second get-session", async () => {
		const redis = new MemoryRedis();
		const token = "tok-support-cache";
		sessions.set(token, {
			userId: "user-sc",
			role: "user",
			activeOrganizationId: null,
		});

		const app = mountApp(redis);
		const req = () =>
			app.handle(
				new Request("http://localhost/auth-support", {
					headers: { cookie: cookieFor(token) },
				}),
			);

		expect((await req()).status).toBe(200);
		const hits = getSessionHits;
		const second = await req();
		expect(second.status).toBe(200);
		expect(getSessionHits).toBe(hits);
		expect(
			((await second.json()) as { isPlatformAdmin: boolean }).isPlatformAdmin,
		).toBe(false);
	});

	test("authSupport: super-admin sets isPlatformAdmin", async () => {
		const redis = new MemoryRedis();
		const token = "tok-support-admin";
		sessions.set(token, {
			userId: "admin-s",
			role: PLATFORM_ADMIN_ROLE,
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-support", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		expect(((await res.json()) as { isPlatformAdmin: boolean }).isPlatformAdmin).toBe(
			true,
		);
	});

	test("authCollab: session returns profile + org", async () => {
		const redis = new MemoryRedis();
		const token = "tok-collab";
		sessions.set(token, {
			userId: "user-c",
			role: "user",
			email: "c@example.com",
			name: "Collab",
			image: "https://img",
			activeOrganizationId: "org-c",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/auth-collab", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as Record<string, unknown>;
		expect(body).toMatchObject({
			userId: "user-c",
			organizationId: "org-c",
			platformRole: "user",
			authType: "session",
			userEmail: "c@example.com",
			userName: "Collab",
			userImage: "https://img",
		});
	});

	test("authCollab: writes lean cache for subsequent auth", async () => {
		const redis = new MemoryRedis();
		const token = "tok-collab-cache";
		sessions.set(token, {
			userId: "user-cc",
			activeOrganizationId: "org-cc",
		});

		const app = mountApp(redis);
		await app.handle(
			new Request("http://localhost/auth-collab", {
				headers: { cookie: cookieFor(token) },
			}),
		);
		const hits = getSessionHits;
		const lean = await app.handle(
			new Request("http://localhost/auth", {
				headers: { cookie: cookieFor(token) },
			}),
		);
		expect(lean.status).toBe(200);
		expect(getSessionHits).toBe(hits);
	});
});

describe("resolveApiKeyInternalOrSession (mail composer)", () => {
	const secret = "mail-secret";

	test("order: API key → internal → session; invalid key fails closed", async () => {
		const redis = new MemoryRedis();
		const deps = {
			baseUrl,
			redis,
			ttl: 5,
			internalSecret: secret,
		};

		const token = "tok-mail";
		sessions.set(token, {
			userId: "session-u",
			activeOrganizationId: "session-o",
		});

		const headers = new Headers({
			"x-api-key": "rl_prod_bad!!!!!!!!!!!!!!!!",
			"x-internal-secret": secret,
			"x-user-id": "int-u",
			"x-organization-id": "int-o",
			cookie: cookieFor(token),
		});

		const failed = await resolveApiKeyInternalOrSession(headers, deps);
		expect(failed).toBeNull();

		const internalOnly = await resolveApiKeyInternalOrSession(
			new Headers({
				"x-internal-secret": secret,
				"x-user-id": "int-u",
				"x-organization-id": "int-o",
			}),
			deps,
		);
		expect(internalOnly).toEqual({
			userId: "int-u",
			organizationId: "int-o",
			platformRole: null,
			authType: "internal",
		});

		const sessionOnly = await resolveApiKeyInternalOrSession(
			new Headers({ cookie: cookieFor(token) }),
			deps,
		);
		expect(sessionOnly?.authType).toBe("session");
		expect(sessionOnly?.userId).toBe("session-u");
	});
});

describe("createAuthPlugin config", () => {
	test("throws when neither redisUrl nor redis provided", () => {
		expect(() =>
			createAuthPlugin({ baseUrl: "http://localhost" }),
		).toThrow(/redisUrl/);
	});
});
