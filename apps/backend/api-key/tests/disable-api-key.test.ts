import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { dbState, resetDbState } from "./helpers/mock-modules";
import { TEST_KEY_ID, makeApiKeyWithUser, noAuth, withAuth } from "./helpers/fixtures";
import { createApp } from "../src/app";

const app = createApp();
const api = treaty(app);

describe("POST /v1/disable/:api_key_id — Disable API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — disables an enabled key", async () => {
		const disabledRow = makeApiKeyWithUser({ enabled: false });
		dbState.update = [disabledRow];
		dbState.findFirst = disabledRow;

		const { data, status } = await api.v1.disable({ api_key_id: TEST_KEY_ID }).post(undefined, withAuth);

		expect(status).toBe(200);
		expect((data as { enabled: boolean }).enabled).toBe(false);
	});

	it("200 — idempotent: already-disabled key returns 200", async () => {
		dbState.update = [];
		dbState.findFirst = makeApiKeyWithUser({ enabled: false });

		const { data, status } = await api.v1.disable({ api_key_id: TEST_KEY_ID }).post(undefined, withAuth);

		expect(status).toBe(200);
		expect((data as { enabled: boolean }).enabled).toBe(false);
	});

	it("404 — key not found", async () => {
		dbState.update = [];
		dbState.findFirst = undefined;
		const { status } = await api.v1.disable({ api_key_id: "bad_id" }).post(undefined, withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api.v1.disable({ api_key_id: TEST_KEY_ID }).post(undefined, noAuth);
		expect(status).toBe(401);
	});
});
