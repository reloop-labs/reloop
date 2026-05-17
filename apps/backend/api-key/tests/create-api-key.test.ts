import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createApp } from "../src/app";
import { makeApiKeyRow, noAuth, withAuth } from "./helpers/fixtures";
import { dbState, resetDbState } from "./helpers/mock-modules";

const app = createApp();
const api = treaty(app);

describe("POST /v1/ — Create API Key", () => {
	beforeAll(() => resetDbState());
	afterEach(() => resetDbState());

	it("201 — creates a key with valid name and auth", async () => {
		const keyRow = makeApiKeyRow();
		dbState.insert = [keyRow];

		const { data, status, error } = await api.v1.post(
			{ name: "My Production Key" },
			withAuth,
		);

		if (status !== 201) console.log("DEBUG create 201 failure:", status, error);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			id: keyRow.id,
			name: keyRow.name,
			object: "api_key",
			enabled: true,
		});
		expect(typeof (data as { key?: string })?.key).toBe("string");
	});

	it("401 — no auth header returns 401", async () => {
		const { status } = await api.v1.post({ name: "My Key" }, noAuth);
		expect(status).toBe(401);
	});

	it("422 — missing name field", async () => {
		// @ts-expect-error — intentionally bad payload
		const { status } = await api.v1.post({}, withAuth);
		expect(status).toBe(422);
	});

	it("422 — empty name string", async () => {
		const { status } = await api.v1.post({ name: "" }, withAuth);
		expect(status).toBe(422);
	});

	it("422 — name exceeds 255 characters", async () => {
		const { status } = await api.v1.post({ name: "a".repeat(256) }, withAuth);
		expect(status).toBe(422);
	});

	it("500 — DB insert returns empty (simulated failure)", async () => {
		dbState.insert = [];
		const { status } = await api.v1.post({ name: "Failing Key" }, withAuth);
		expect(status).toBe(500);
	});
});
