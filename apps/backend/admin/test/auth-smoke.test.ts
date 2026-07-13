/**
 * Smoke: admin special-service migration (authAdmin + authSupport).
 */
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { Elysia } from "elysia";

class MemoryRedis {
	private store = new Map<string, string>();
	async get<T>(key: string): Promise<T | undefined> {
		const raw = this.store.get(key);
		if (raw === undefined) return undefined;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return raw as unknown as T;
		}
	}
	async set(key: string, value: unknown): Promise<void> {
		this.store.set(
			key,
			typeof value === "string" ? value : JSON.stringify(value),
		);
	}
	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

const sessions = new Map<
	string,
	{ userId: string; activeOrganizationId?: string | null; role?: string }
>();
let fakeAuth: ReturnType<Elysia["listen"]> | null = null;
let baseUrl = "";

beforeAll(async () => {
	const app = new Elysia().get(
		"/api/auth/v1/get-session",
		({ request, set }) => {
			const cookie = request.headers.get("cookie") ?? "";
			const match = cookie.match(/reloop\.session_token=([^.;]+)/);
			const token = match?.[1];
			if (!token || !sessions.has(token)) {
				set.status = 200;
				return null;
			}
			const s = sessions.get(token)!;
			return {
				user: {
					id: s.userId,
					role: s.role ?? "user",
					activeOrganizationId: s.activeOrganizationId ?? null,
				},
			};
		},
	);
	fakeAuth = app.listen(0);
	baseUrl = `http://127.0.0.1:${fakeAuth.server?.port}`;
});
afterAll(() => fakeAuth?.stop());
beforeEach(() => sessions.clear());

function mountAdminLike(redis: MemoryRedis) {
	return new Elysia()
		.use(createAuthPlugin({ baseUrl, redis, ttl: 5 }))
		.get(
			"/overview",
			({ userId, platformRole }) => ({ userId, platformRole }),
			{ authAdmin: true },
		)
		.get(
			"/support",
			({ userId, isPlatformAdmin }) => ({ userId, isPlatformAdmin }),
			{ authSupport: true },
		);
}

describe("admin special-service smoke", () => {
	test("authAdmin rejects regular user", async () => {
		const redis = new MemoryRedis();
		sessions.set("u", {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});
		const res = await mountAdminLike(redis).handle(
			new Request("http://localhost/overview", {
				headers: { cookie: "reloop.session_token=u.sig" },
			}),
		);
		expect(res.status).toBe(401);
	});

	test("authAdmin allows super-admin", async () => {
		const redis = new MemoryRedis();
		sessions.set("a", {
			userId: "admin-1",
			role: PLATFORM_ADMIN_ROLE,
			activeOrganizationId: null,
		});
		const res = await mountAdminLike(redis).handle(
			new Request("http://localhost/overview", {
				headers: { cookie: "reloop.session_token=a.sig" },
			}),
		);
		expect(res.status).toBe(200);
		expect(
			((await res.json()) as { platformRole: string }).platformRole,
		).toBe(PLATFORM_ADMIN_ROLE);
	});

	test("authSupport allows any signed-in user and sets isPlatformAdmin", async () => {
		const redis = new MemoryRedis();
		sessions.set("u", {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});
		const res = await mountAdminLike(redis).handle(
			new Request("http://localhost/support", {
				headers: { cookie: "reloop.session_token=u.sig" },
			}),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			userId: string;
			isPlatformAdmin: boolean;
		};
		expect(body.userId).toBe("user-1");
		expect(body.isPlatformAdmin).toBe(false);
	});
});
