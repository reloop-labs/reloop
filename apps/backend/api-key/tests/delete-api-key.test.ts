import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createApp } from "../src/app";
import { noAuth, TEST_KEY_ID, withAuth } from "./helpers/fixtures";
import { dbState, resetDbState, WEBHOOK_EVENTS } from "./helpers/mock-modules";

const app = createApp();
const api = treaty(app);

describe("DELETE /v1/:api_key_id — Delete API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — deletes key and returns confirmation", async () => {
		dbState.deleteRow = [{ id: TEST_KEY_ID }];

		const { data, status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.delete({}, withAuth);

		expect(status).toBe(200);
		const res = data as { id: string; message: string; object: string };
		expect(res.id).toBe(TEST_KEY_ID);
		expect(res.message).toBe("API key deleted successfully");
		expect(res.object).toBe("api_key");
	});

	it("200 — response includes event field", async () => {
		dbState.deleteRow = [{ id: TEST_KEY_ID }];

		const { data, status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.delete({}, withAuth);

		expect(status).toBe(200);
		expect((data as { event: string }).event).toBe(
			WEBHOOK_EVENTS.API_KEY_DELETE_WEBHOOK_EVENT.id,
		);
	});

	it("404 — key not found", async () => {
		dbState.deleteRow = [];
		const { status } = await api
			.v1({ api_key_id: "nonexistent_id" })
			.delete({}, withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.delete(undefined, noAuth);
		expect(status).toBe(401);
	});
});
