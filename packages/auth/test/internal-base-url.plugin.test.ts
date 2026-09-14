import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { MemoryRedis } from "./memory-redis";

const COOKIE = "reloop.session_token=tok.fakesig";

let publicHits = 0;
let internalHits = 0;
let publicServer: ReturnType<Elysia["listen"]> | null = null;
let internalServer: ReturnType<Elysia["listen"]> | null = null;
let publicBaseUrl = "";
let internalBaseUrl = "";

function mount(config: { baseUrl: string; internalBaseUrl?: string }) {
	return new Elysia()
		.use(
			createAuthPlugin({
				...config,
				redis: new MemoryRedis(`t${Math.random()}`),
				ttl: 5,
			}),
		)
		.get("/protected", ({ userId }) => ({ userId }), { auth: true });
}

beforeAll(async () => {
	publicServer = new Elysia()
		.get("/api/auth/v1/get-session", ({ set }) => {
			publicHits += 1;
			set.status = 401;
			return "";
		})
		.listen(0);

	internalServer = new Elysia()
		.get("/api/auth/v1/get-session", () => {
			internalHits += 1;
			return {
				user: { id: "user_1", activeOrganizationId: "org_1" },
				session: { activeOrganizationId: "org_1" },
			};
		})
		.listen(0);

	publicBaseUrl = `http://127.0.0.1:${publicServer.server?.port}`;
	internalBaseUrl = `http://127.0.0.1:${internalServer.server?.port}`;
});

afterAll(() => {
	publicServer?.stop();
	internalServer?.stop();
});

describe("internal auth base url", () => {
	test("without an override the public origin is used, and its 401 stands", async () => {
		const before = publicHits;
		const res = await mount({ baseUrl: publicBaseUrl }).handle(
			new Request("http://local/protected", { headers: { cookie: COOKIE } }),
		);

		expect(res.status).toBe(401);
		expect(publicHits).toBe(before + 1);
	});

	test("an override routes session validation to the internal origin", async () => {
		const beforePublic = publicHits;
		const beforeInternal = internalHits;

		const res = await mount({
			baseUrl: publicBaseUrl,
			internalBaseUrl,
		}).handle(
			new Request("http://local/protected", { headers: { cookie: COOKIE } }),
		);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ userId: "user_1" });
		expect(internalHits).toBe(beforeInternal + 1);
		expect(publicHits).toBe(beforePublic);
	});
});
