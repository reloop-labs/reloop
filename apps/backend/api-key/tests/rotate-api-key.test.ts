import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createApp } from "../src/app";
import {
	makeApiKeyWithUser,
	noAuth,
	TEST_KEY_ID,
	withAuth,
} from "./helpers/fixtures";
import { dbState, MOCK_FULL_KEY, resetDbState } from "./helpers/mock-modules";

const app = createApp();
const api = treaty(app);

describe("POST /v1/rotate/:api_key_id — Rotate API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — returns a new key after rotation", async () => {
		const existing = makeApiKeyWithUser();
		dbState.findFirst = existing;
		dbState.update = [{ ...existing, start: "rl_live_" }];

		const { data, status } = await api.v1
			.rotate({ api_key_id: TEST_KEY_ID })
			.post(undefined, withAuth);

		expect(status).toBe(200);
		const res = data as { id: string; key: string };
		expect(res.id).toBe(TEST_KEY_ID);
		expect(typeof res.key).toBe("string");
	});

	it("200 — returned key matches the mock generated key", async () => {
		const existing = makeApiKeyWithUser();
		dbState.findFirst = existing;
		dbState.update = [{ ...existing }];

		const { data } = await api.v1
			.rotate({ api_key_id: TEST_KEY_ID })
			.post(undefined, withAuth);

		expect((data as { key: string }).key).toBe(MOCK_FULL_KEY);
	});

	it("404 — key not found", async () => {
		dbState.findFirst = undefined;
		const { status } = await api.v1
			.rotate({ api_key_id: "bad_id" })
			.post(undefined, withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api.v1
			.rotate({ api_key_id: TEST_KEY_ID })
			.post(undefined, noAuth);
		expect(status).toBe(401);
	});
});
