import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { dbState, resetDbState } from "./helpers/mock-modules";
import { makeApiKeyWithUser, noAuth, withAuth } from "./helpers/fixtures";
import { createApp } from "../src/app";

const app = createApp();
const api = treaty(app);

describe("GET /v1/ — List API Keys", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — returns paginated list with defaults", async () => {
		dbState.findMany = [makeApiKeyWithUser(), makeApiKeyWithUser({ id: "api_key_other" })];
		dbState.selectCount = [{ count: 2 }];

		const { data, status } = await api.v1.get(withAuth);

		expect(status).toBe(200);
		const res = data as { apiKeys: unknown[]; total: number; page: number; limit: number };
		expect(res.apiKeys).toHaveLength(2);
		expect(res.total).toBe(2);
		expect(res.page).toBe(1);
		expect(res.limit).toBe(10);
	});

	it("200 — respects page and limit query params", async () => {
		dbState.findMany = [];
		dbState.selectCount = [{ count: 0 }];

		const { data, status } = await api.v1.get({ ...withAuth, query: { page: 2, limit: 5 } });

		expect(status).toBe(200);
		const res = data as { page: number; limit: number };
		expect(res.page).toBe(2);
		expect(res.limit).toBe(5);
	});

	it("200 — filters by enabled status", async () => {
		dbState.findMany = [makeApiKeyWithUser({ enabled: true })];
		dbState.selectCount = [{ count: 1 }];

		const { data, status } = await api.v1.get({ ...withAuth, query: { enabled: true } });

		expect(status).toBe(200);
		expect((data as { apiKeys: Array<{ enabled: boolean }> }).apiKeys[0]?.enabled).toBe(true);
	});

	it("200 — search query accepted", async () => {
		dbState.findMany = [];
		dbState.selectCount = [{ count: 0 }];

		const { data, status } = await api.v1.get({ ...withAuth, query: { q: "production" } });

		expect(status).toBe(200);
		expect((data as { total: number }).total).toBe(0);
	});

	it("200 — empty list when no keys exist", async () => {
		dbState.findMany = [];
		dbState.selectCount = [{ count: 0 }];

		const { data, status } = await api.v1.get(withAuth);

		expect(status).toBe(200);
		const res = data as { apiKeys: unknown[]; total: number };
		expect(res.apiKeys).toHaveLength(0);
		expect(res.total).toBe(0);
	});

	it("401 — no auth header", async () => {
		const { status } = await api.v1.get(noAuth);
		expect(status).toBe(401);
	});

	it("422 — limit below minimum (0)", async () => {
		const { status } = await api.v1.get({ ...withAuth, query: { limit: 0 } });
		expect(status).toBe(422);
	});

	it("422 — limit above maximum (101)", async () => {
		const { status } = await api.v1.get({ ...withAuth, query: { limit: 101 } });
		expect(status).toBe(422);
	});
});
