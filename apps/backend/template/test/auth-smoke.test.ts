/**
 * Smoke: webhook batch-A migration onto @reloop/auth/middleware.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { randomBytes } from "node:crypto";
import {
	API_KEY_PREFIX,
	getApiKeyCacheKey,
	hashApiKey,
} from "@reloop/auth/apikey";
import {
	createAuthPlugin,
	type AuthContext,
} from "@reloop/auth/middleware";
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
	{ userId: string; activeOrganizationId?: string | null }
>();
let fakeAuth: ReturnType<Elysia["listen"]> | null = null;
let baseUrl = "";

beforeAll(async () => {
	const app = new Elysia().get("/api/auth/v1/get-session", ({ request, set }) => {
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
				activeOrganizationId: s.activeOrganizationId ?? null,
			},
		};
	});
	fakeAuth = app.listen(0);
	baseUrl = `http://127.0.0.1:${fakeAuth.server?.port}`;
});
afterAll(() => fakeAuth?.stop());
beforeEach(() => sessions.clear());

function app(redis: MemoryRedis) {
	return new Elysia()
		.use(createAuthPlugin({ baseUrl, redis, ttl: 5 }))
		.get(
			"/protected",
			({ userId, organizationId, authType }) => ({
				userId,
				organizationId,
				authType,
			}),
			{ auth: true },
		);
}

describe("template batch-B smoke", () => {
	test("session with org → 200", async () => {
		const redis = new MemoryRedis();
		sessions.set("tok", {
			userId: "u1",
			activeOrganizationId: "org-1",
		});
		const res = await app(redis).handle(
			new Request("http://localhost/protected", {
				headers: { cookie: "reloop.session_token=tok.sig" },
			}),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as AuthContext;
		expect(body.organizationId).toBe("org-1");
		expect(body.authType).toBe("session");
	});

	test("no credentials → 401", async () => {
		const res = await app(new MemoryRedis()).handle(
			new Request("http://localhost/protected"),
		);
		expect(res.status).toBe(401);
	});

	test("api key → 200", async () => {
		const redis = new MemoryRedis();
		const raw = `${API_KEY_PREFIX}_${randomBytes(12).toString("base64url")}`;
		await redis.set(getApiKeyCacheKey(hashApiKey(raw)), {
			userId: "ku",
			organizationId: "ko",
			apiKeyId: "kid",
		});
		const res = await app(redis).handle(
			new Request("http://localhost/protected", {
				headers: { "x-api-key": raw },
			}),
		);
		expect(res.status).toBe(200);
		expect(((await res.json()) as AuthContext).authType).toBe("apikey");
	});
});
