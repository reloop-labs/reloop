/**
 * Smoke: credits special-service migration (auth + platformAdmin).
 */
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import {
	createAuthPlugin,
	type AuthContext,
} from "@reloop/auth/middleware";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { Elysia } from "elysia";

class MemoryRedis {
	private store = new Map<string, string>();
	constructor(private prefix = "reloop-session") {}
	private full(k: string) {
		return `${this.prefix}:${k}`;
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

function app(redis: MemoryRedis) {
	return new Elysia()
		.use(createAuthPlugin({ baseUrl, redis, ttl: 5 }))
		.get(
			"/usage",
			({ userId, organizationId }) => ({ userId, organizationId }),
			{ auth: true },
		)
		.get(
			"/topup",
			({ userId, role }) => ({ userId, role }),
			{ platformAdmin: true },
		);
}

describe("credits special-service smoke", () => {
	test("customer auth with org → 200", async () => {
		const redis = new MemoryRedis();
		sessions.set("cust", {
			userId: "u1",
			activeOrganizationId: "org-1",
			role: "user",
		});
		const res = await app(redis).handle(
			new Request("http://localhost/usage", {
				headers: { cookie: "reloop.session_token=cust.sig" },
			}),
		);
		expect(res.status).toBe(200);
		expect(((await res.json()) as AuthContext).organizationId).toBe("org-1");
	});

	test("platformAdmin endpoint rejects non-admin", async () => {
		const redis = new MemoryRedis();
		sessions.set("cust", {
			userId: "u1",
			activeOrganizationId: "org-1",
			role: "user",
		});
		const res = await app(redis).handle(
			new Request("http://localhost/topup", {
				headers: { cookie: "reloop.session_token=cust.sig" },
			}),
		);
		expect(res.status).toBe(401);
	});

	test("platformAdmin endpoint allows super-admin", async () => {
		const redis = new MemoryRedis();
		sessions.set("adm", {
			userId: "admin-1",
			activeOrganizationId: null,
			role: PLATFORM_ADMIN_ROLE,
		});
		const res = await app(redis).handle(
			new Request("http://localhost/topup", {
				headers: { cookie: "reloop.session_token=adm.sig" },
			}),
		);
		expect(res.status).toBe(200);
		expect(((await res.json()) as { role: string }).role).toBe(
			PLATFORM_ADMIN_ROLE,
		);
	});
});
