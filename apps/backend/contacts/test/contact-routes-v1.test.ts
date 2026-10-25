import { describe, expect, test } from "bun:test";
import {
	contactRoutes,
	contactRoutesV1,
} from "@be/contacts/routes/contact/contact.routes";
import { Elysia } from "elysia";

describe("contact routes", () => {
	test("are served at both the unversioned and /v1 paths", () => {
		const app = new Elysia({ prefix: "/api/contacts" })
			.use(contactRoutes)
			.use(contactRoutesV1);
		const routes = new Set(app.routes.map((r) => `${r.method} ${r.path}`));
		const legacy = [...routes].filter((r) => !r.includes("/api/contacts/v1/"));
		expect(legacy.length).toBeGreaterThanOrEqual(14);
		for (const route of legacy) {
			const [method, path] = route.split(" ");
			const versioned = path?.replace("/api/contacts/", "/api/contacts/v1/");
			expect(routes.has(`${method} ${versioned}`)).toBe(true);
		}
		expect(routes.has("POST /api/contacts/v1/create")).toBe(true);
		expect(routes.has("GET /api/contacts/v1/list")).toBe(true);
	});
});

describe("contacts OpenAPI", () => {
	test("documents the /v1 paths and hides the unversioned ones", async () => {
		const { openapi } = await import("@elysiajs/openapi");
		const { legacyContactPaths } = await import(
			"@be/contacts/routes/contact/contact.routes"
		);
		const app = new Elysia({ prefix: "/api/contacts" })
			.use(openapi({ exclude: { paths: legacyContactPaths } }))
			.use(contactRoutes)
			.use(contactRoutesV1);
		const res = await app.handle(
			new Request("http://localhost/api/contacts/openapi/json"),
		);
		const paths = Object.keys(
			((await res.json()) as { paths: Record<string, unknown> }).paths,
		);
		expect(paths).toContain("/api/contacts/v1/create");
		expect(paths).toContain("/api/contacts/v1/{contact_id}");
		expect(paths.filter((p) => !p.startsWith("/api/contacts/v1/"))).toEqual([]);
	});
});
