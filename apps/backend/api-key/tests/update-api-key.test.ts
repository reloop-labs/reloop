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

describe("PATCH /v1/:api_key_id — Update API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("200 — updates name successfully", async () => {
		const updatedRow = makeApiKeyWithUser({ name: "Updated Name" });
		dbState.update = [updatedRow];
		dbState.findFirst = updatedRow;

		const { data, status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.patch({ name: "Updated Name" }, withAuth);

		expect(status).toBe(200);
		expect((data as { name: string }).name).toBe("Updated Name");
	});

	it("404 — key not found", async () => {
		dbState.update = [];
		const { status } = await api
			.v1({ api_key_id: "nonexistent_id" })
			.patch({ name: "New Name" }, withAuth);
		expect(status).toBe(404);
	});

	it("401 — no auth header", async () => {
		const { status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.patch({ name: "Test" }, noAuth);
		expect(status).toBe(401);
	});

	it("422 — missing name in body", async () => {
		const { status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.patch({}, withAuth);
		expect(status).toBe(422);
	});

	it("422 — name exceeds 255 characters", async () => {
		const { status } = await api
			.v1({ api_key_id: TEST_KEY_ID })
			.patch({ name: "x".repeat(256) }, withAuth);
		expect(status).toBe(422);
	});
});
