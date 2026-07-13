/**
 * Smoke: credits special-service migration (auth + authAdmin).
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

function mountCredits(redis: MemoryRedis) {
	return new Elysia()
		.use(createAuthPlugin({ baseUrl, redis, ttl: 5 }))
		.get(
			"/balance",
			({ userId, organizationId }) => ({ userId, organizationId }),
			{ auth: true },
		)
		.get(
			"/topup",
			({ userId, platformRole }) => ({ userId, platformRole }),
			{ authAdmin: true },
		);
}

describe("credits special-service smoke", () => {
	test("auth requires org", async () => {
		const redis = new MemoryRedis();
		sessions.set("u", {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});
		const res = await mountCredits(redis).handle(
			new Request("http://localhost/balance", {
				headers: { cookie: "reloop.session_token=u.sig" },
			}),
		);
		expect(res.status).toBe(200);
	});

	test("authAdmin endpoint rejects non-admin", async () => {
		const redis = new MemoryRedis();
		sessions.set("u", {
			userId: "user-1",
			role: "user",
			activeOrganizationId: "org-1",
		});
		const res = await mountCredits(redis).handle(
			new Request("http://localhost/topup", {
				headers: { cookie: "reloop.session_token=u.sig" },
			}),
		);
		expect(res.status).toBe(401);
	});

	test("authAdmin endpoint allows super-admin", async () => {
		const redis = new MemoryRedis();
		sessions.set("a", {
			userId: "admin-1",
			role: PLATFORM_ADMIN_ROLE,
			activeOrganizationId: null,
		});
		const res = await mountCredits(redis).handle(
			new Request("http://localhost/topup", {
				headers: { cookie: "reloop.session_token=a.sig" },
			}),
		);
		expect(res.status).toBe(200);
		expect(
			((await res.json()) as { platformRole: string }).platformRole,
		).toBe(PLATFORM_ADMIN_ROLE);
	});
});
