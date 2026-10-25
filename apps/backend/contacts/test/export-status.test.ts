import { beforeAll, describe, expect, mock, test } from "bun:test";
import { apiErrorsPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";

const store = new Map<string, unknown>();

mock.module("@be/contacts/utils/loader", () => ({
	redis: {
		get: async (key: string) => store.get(key),
		set: async (key: string, value: unknown) => {
			store.set(key, structuredClone(value));
		},
		delete: async (key: string) => {
			store.delete(key);
		},
	},
}));

mock.module("@be/contacts/middleware/auth", () => ({
	authMiddleware: new Elysia({ name: "test-auth" }).macro({
		auth: {
			resolve({ request }) {
				return {
					organizationId: request.headers.get("x-org") ?? "org_1",
					userId: "user_1",
				};
			},
		},
	}),
}));

let app: Elysia;
let records: typeof import("@be/contacts/routes/contact/export-contacts/export-record");

beforeAll(async () => {
	const { exportStatusRoute } = await import(
		"@be/contacts/routes/contact/export-contacts/export-status.route"
	);
	records = await import(
		"@be/contacts/routes/contact/export-contacts/export-record"
	);
	app = new Elysia({ prefix: "/api/contacts/v1" })
		.use(apiErrorsPlugin())
		.use(exportStatusRoute) as unknown as Elysia;
});

const poll = (id: string, org = "org_1") =>
	app.handle(
		new Request(`http://localhost/api/contacts/v1/exports/${id}`, {
			headers: { "x-org": org },
		}),
	);

describe("GET /exports/:export_id", () => {
	test("walks a job from queued to ready", async () => {
		await records.writeExportRecord("exp_1", {
			organizationId: "org_1",
			status: "queued",
			totalRows: 12,
			recipient: "owner@example.com",
			createdAt: "2026-10-25T10:00:00.000Z",
		});
		expect(records.exportStatusPath("exp_1")).toBe(
			"/api/contacts/v1/exports/exp_1",
		);

		const queued = await poll("exp_1");
		expect(queued.status).toBe(200);
		expect(queued.headers.get("retry-after")).toBe("5");
		expect(await queued.json()).toMatchObject({
			object: "contact_export",
			id: "exp_1",
			status: "queued",
			completedAt: null,
		});

		await records.updateExportRecord("exp_1", {
			status: "ready",
			totalRows: 11,
			completedAt: "2026-10-25T10:00:09.000Z",
		});
		const ready = await poll("exp_1");
		expect(ready.headers.get("retry-after")).toBeNull();
		expect(await ready.json()).toMatchObject({
			status: "ready",
			totalRows: 11,
			recipient: "owner@example.com",
			completedAt: "2026-10-25T10:00:09.000Z",
		});
	});

	test("hides other organizations' jobs and unknown IDs", async () => {
		const other = await poll("exp_1", "org_2");
		expect(other.status).toBe(404);
		expect(await other.json()).toMatchObject({
			code: "not_found",
			message: "Export not found",
		});
		expect((await poll("exp_missing")).status).toBe(404);
	});
});
