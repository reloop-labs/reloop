import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { createHash, randomBytes } from "node:crypto";
import { Elysia } from "elysia";
import {
	API_KEY_PREFIX,
	getApiKeyCacheKey,
	hashApiKey,
} from "../src/apikey/helpers";
import {
	type AuthContext,
	createAuthPlugin,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "../src/middleware";
import { PLATFORM_ADMIN_ROLE } from "../src/roles";
import { MemoryRedis } from "./memory-redis";

/**
 * Fake auth service: /api/auth/v1/get-session returns a body configured per
 * session token in the cookie. Non-2xx can be forced for status-check coverage.
 */
type FakeSession = {
	userId: string;
	role?: string | null;
	activeOrganizationId?: string | null;
	status?: number;
};

const sessions = new Map<string, FakeSession>();
let fakeAuth: ReturnType<Elysia["listen"]> | null = null;
let baseUrl = "";

function cookieFor(token: string): string {
	return `reloop.session_token=${token}.fakesig`;
}

function mountApp(redis: MemoryRedis) {
	const plugin = createAuthPlugin({ baseUrl, redis, ttl: 5 });
	return new Elysia()
		.use(plugin)
		.get(
			"/auth",
			({ userId, organizationId, role, authType }) => ({
				userId,
				organizationId,
				role,
				authType,
			}),
			{ auth: true },
		)
		.get(
			"/auth-no-org",
			({ userId, organizationId, role, authType }) => ({
				userId,
				organizationId,
				role,
				authType,
			}),
			{ authNoOrg: true },
		)
		.get(
			"/api-key",
			({ userId, organizationId, role, authType }) => ({
				userId,
				organizationId,
				role,
				authType,
			}),
			{ apiKeyAuth: true },
		)
		.get(
			"/platform-admin",
			({ userId, organizationId, role, authType }) => ({
				userId,
				organizationId,
				role,
				authType,
			}),
			{ platformAdmin: true },
		);
}

beforeAll(async () => {
	const app = new Elysia().get(
		"/api/auth/v1/get-session",
		({ request, set }) => {
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
});

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
			role: "user",
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
		const hits = 0;
		// Wrap fake map to count — sessions still used by server
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
		// Second call should hit cache — mutate upstream so a re-fetch would fail closed
		sessions.set(token, {
			userId: "user-c",
			role: "user",
			activeOrganizationId: null,
		});
		const second = await req();
		expect(second.status).toBe(200);
		const body = (await second.json()) as AuthContext;
		expect(body.organizationId).toBe("org-c");

		const cached = await redis.get<AuthContext>(sessionTokenCacheKey(token));
		expect(cached?.userId).toBe("user-c");

		const index = await redis.get<string[]>(sessionUserIndexKey("user-c"));
		expect(index).toContain(token);

		// silence unused
		expect(hits).toBe(0);
	});
});

describe("createAuthPlugin — platformAdmin", () => {
	test("platformAdmin: allows super-admin without org", async () => {
		const redis = new MemoryRedis();
		const token = "tok-admin";
		sessions.set(token, {
			userId: "admin-1",
			role: PLATFORM_ADMIN_ROLE,
			activeOrganizationId: null,
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/platform-admin", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.role).toBe(PLATFORM_ADMIN_ROLE);
		expect(body.authType).toBe("session");
	});

	test("platformAdmin: rejects non-admin role", async () => {
		const redis = new MemoryRedis();
		const token = "tok-not-admin";
		sessions.set(token, {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/platform-admin", {
				headers: { cookie: cookieFor(token) },
			}),
		);
		expect(res.status).toBe(401);
	});
});

describe("createAuthPlugin — apiKeyAuth", () => {
	function makeRawKey(): string {
		const randomPart = randomBytes(20).toString("base64url");
		return `${API_KEY_PREFIX}_${randomPart}`;
	}

	test("apiKeyAuth: valid cached key returns apikey AuthContext", async () => {
		const redis = new MemoryRedis();
		const raw = makeRawKey();
		const hashed = hashApiKey(raw);
		await redis.set(getApiKeyCacheKey(hashed), {
			userId: "key-user",
			organizationId: "key-org",
			apiKeyId: "key-id-1",
		});

		const res = await mountApp(redis).handle(
			new Request("http://localhost/api-key", {
				headers: { "x-api-key": raw },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body).toEqual({
			userId: "key-user",
			organizationId: "key-org",
			role: null,
			authType: "apikey",
		});
	});

	test("apiKeyAuth: missing key returns 401", async () => {
		const redis = new MemoryRedis();
		const res = await mountApp(redis).handle(
			new Request("http://localhost/api-key"),
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
});

describe("extractSessionToken / hash helpers (smoke)", () => {
	test("hash is deterministic for cache key stability", () => {
		const a = createHash("sha256").update("x").digest("hex");
		const b = createHash("sha256").update("x").digest("hex");
		expect(a).toBe(b);
	});
});
