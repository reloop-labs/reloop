/**
 * Smoke tests for the upload pilot migration onto `@reloop/auth/middleware`.
 *
 * Login/logout themselves live on the auth service (covered by the #44
 * characterization tripwire). Here we prove the two protected upload surfaces
 * accept session cookies and API keys via the shared plugin and reject
 * unauthenticated calls.
 */
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { randomBytes } from "node:crypto";
import {
	API_KEY_PREFIX,
	getApiKeyCacheKey,
	hashApiKey,
} from "@reloop/auth/apikey";
import { type AuthContext, createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";

/** Minimal in-memory redis matching AuthRedis. */
class MemoryRedis {
	private store = new Map<string, string>();
	private prefix: string;
	constructor(prefix = "reloop-session") {
		this.prefix = prefix;
	}
	private full(key: string) {
		return `${this.prefix}:${key}`;
	}
	async get<T>(key: string): Promise<T | undefined> {
		const raw = this.store.get(this.full(key));
		if (raw === undefined) return undefined;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return raw as unknown as T;
		}
	}
	async set(key: string, value: unknown): Promise<void> {
		this.store.set(
			this.full(key),
			typeof value === "string" ? value : JSON.stringify(value),
		);
	}
	async delete(key: string): Promise<void> {
		this.store.delete(this.full(key));
	}
}

type FakeSession = {
	userId: string;
	role?: string | null;
	activeOrganizationId?: string | null;
};

const sessions = new Map<string, FakeSession>();
let fakeAuth: ReturnType<Elysia["listen"]> | null = null;
let baseUrl = "";

function cookieFor(token: string): string {
	return `reloop.session_token=${token}.fakesig`;
}

function mountProtectedApp(redis: MemoryRedis) {
	const plugin = createAuthPlugin({ baseUrl, redis, ttl: 5 });
	return (
		new Elysia()
			.use(plugin)
			// Mirrors production: user-scoped upload endpoints use authNoOrg.
			.get(
				"/protected",
				({ userId, organizationId, role, authType }) => ({
					userId,
					organizationId,
					role,
					authType,
				}),
				{ authNoOrg: true },
			)
	);
}

beforeAll(async () => {
	const app = new Elysia().get(
		"/api/auth/v1/get-session",
		({ request, set }) => {
			const cookie = request.headers.get("cookie") ?? "";
			const match = cookie.match(/reloop\.session_token=([^.;]+)/);
			const token = match?.[1] ? decodeURIComponent(match[1]) : null;
			if (!token || !sessions.has(token)) {
				set.status = 200;
				return null;
			}
			const session = sessions.get(token)!;
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
	if (!port) throw new Error("fake auth failed to bind");
	baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(() => {
	fakeAuth?.stop();
});

beforeEach(() => {
	sessions.clear();
});

describe("upload pilot — protected endpoint (session)", () => {
	test("session cookie grants access via authNoOrg", async () => {
		const redis = new MemoryRedis();
		const token = "upload-session";
		sessions.set(token, {
			userId: "user-upload",
			activeOrganizationId: null,
		});

		const res = await mountProtectedApp(redis).handle(
			new Request("http://localhost/protected", {
				headers: { cookie: cookieFor(token) },
			}),
		);

		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.userId).toBe("user-upload");
		expect(body.authType).toBe("session");
	});

	test("missing credentials return 401", async () => {
		const redis = new MemoryRedis();
		const res = await mountProtectedApp(redis).handle(
			new Request("http://localhost/protected"),
		);
		expect(res.status).toBe(401);
	});
});

describe("upload pilot — API key call", () => {
	test("x-api-key grants access with apikey AuthContext", async () => {
		const redis = new MemoryRedis();
		const raw = `${API_KEY_PREFIX}_${randomBytes(20).toString("base64url")}`;
		await redis.set(getApiKeyCacheKey(hashApiKey(raw)), {
			userId: "key-user",
			organizationId: "key-org",
			apiKeyId: "key-1",
		});

		const res = await mountProtectedApp(redis).handle(
			new Request("http://localhost/protected", {
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
});
