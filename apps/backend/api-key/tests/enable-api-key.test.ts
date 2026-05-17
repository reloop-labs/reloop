import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createApp } from "../src/app";
import {
	makeApiKeyWithUser,
	noAuth,
	TEST_KEY_ID,
	withAuth,
} from "./helpers/fixtures";
import { dbState, resetDbState } from "./helpers/mock-modules";

const app = createApp();
const api = treaty(app);

describe("POST /v1/enable/:api_key_id — Enable API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — enables a disabled key", async () => {
		const enabledRow = makeApiKeyWithUser({ enabled: true });
		dbState.update = [enabledRow];
		dbState.findFirst = enabledRow;

		const { data, status } = await api.v1
			.enable({ api_key_id: TEST_KEY_ID })
			.post(undefined, withAuth);

		expect(status).toBe(200);
		expect((data as { enabled: boolean }).enabled).toBe(true);
	});

	it("200 — idempotent: already-enabled key returns 200", async () => {
		dbState.update = [];
		dbState.findFirst = makeApiKeyWithUser({ enabled: true });

		const { data, status } = await api.v1
			.enable({ api_key_id: TEST_KEY_ID })
			.post(undefined, withAuth);

		expect(status).toBe(200);
		expect((data as { enabled: boolean }).enabled).toBe(true);
	});

	it("404 — key not found", async () => {
		dbState.update = [];
		dbState.findFirst = undefined;
		const { status } = await api.v1
			.enable({ api_key_id: "bad_id" })
			.post(undefined, withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api.v1
			.enable({ api_key_id: TEST_KEY_ID })
			.post(undefined, noAuth);
		expect(status).toBe(401);
	});
});
