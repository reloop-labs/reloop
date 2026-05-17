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

describe("GET /v1/:api_key_id — Get API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — returns key details for valid ID", async () => {
		dbState.findFirst = makeApiKeyWithUser();
		const { data, status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.get(withAuth);
		expect(status).toBe(200);
		expect(data).toMatchObject({ id: TEST_KEY_ID, object: "api_key" });
	});

	it("404 — key not found", async () => {
		dbState.findFirst = undefined;
		const { status } = await api
			.v1({ api_key_id: "nonexistent_id" })
			.get(withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api.v1({ api_key_id: TEST_KEY_ID }).get(noAuth);
		expect(status).toBe(401);
	});

	it("200 — response includes createdBy user info", async () => {
		dbState.findFirst = makeApiKeyWithUser(
			{},
			{ name: "Alice", email: "alice@test.com" },
		);
		const { data, status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.get(withAuth);
		expect(status).toBe(200);
		expect((data as { createdBy?: { email: string } })?.createdBy?.email).toBe(
			"alice@test.com",
		);
	});
});
