import { describe, expect, test } from "bun:test";
import { openapi } from "@elysiajs/openapi";
import {
	apiErrorsPlugin,
	buildDeprecationHeaders,
	deprecationPlugin,
} from "@reloop/auth/middleware";
import { Elysia, t } from "elysia";

const deprecated = {
	since: "2026-11-01",
	sunset: "2027-05-01",
	successor: "/api/test/v1/items",
};

const routes = new Elysia()
	.use(deprecationPlugin)
	.post("/items", ({ body }) => body, {
		body: t.Object({ name: t.String() }),
		deprecated,
	})
	.get("/current", () => "ok");

const app = new Elysia({ prefix: "/api/test" })
	.use(openapi())
	.use(apiErrorsPlugin())
	.use(routes);

const post = (body: string) =>
	app.handle(
		new Request("http://localhost/api/test/items", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body,
		}),
	);

describe("deprecation", () => {
	test("builds RFC 9745 / RFC 8594 headers", () => {
		expect(buildDeprecationHeaders(deprecated)).toEqual({
			deprecation: `@${Date.UTC(2026, 10, 1) / 1000}`,
			sunset: "Sat, 01 May 2027 00:00:00 GMT",
			link: '<https://reloop.sh/docs/api/versioning>; rel="deprecation", </api/test/v1/items>; rel="successor-version"',
		});
	});

	test("rejects a sunset with less than 180 days notice", () => {
		expect(() =>
			buildDeprecationHeaders({ since: "2026-11-01", sunset: "2027-01-01" }),
		).toThrow("180 days");
		expect(() =>
			buildDeprecationHeaders({ since: "soon", sunset: "2027-01-01" }),
		).toThrow("valid date");
	});

	test("headers on success and on validation errors, not on other routes", async () => {
		const ok = await post('{"name":"a"}');
		expect(ok.status).toBe(200);
		expect(ok.headers.get("deprecation")).toStartWith("@");
		expect(ok.headers.get("sunset")).toBe("Sat, 01 May 2027 00:00:00 GMT");

		const invalid = await post('{"name":1}');
		expect(invalid.status).toBe(422);
		expect(invalid.headers.get("deprecation")).toStartWith("@");

		const current = await app.handle(
			new Request("http://localhost/api/test/current"),
		);
		expect(current.headers.get("deprecation")).toBeNull();
	});

	test("marks the OpenAPI operation deprecated", async () => {
		const res = await app.handle(
			new Request("http://localhost/api/test/openapi/json"),
		);
		const spec = (await res.json()) as {
			paths: Record<string, Record<string, Record<string, unknown>>>;
		};
		const op = spec.paths["/api/test/items"]?.post;
		expect(op?.deprecated).toBe(true);
		expect(op?.["x-sunset"]).toBe("2027-05-01");
		expect(spec.paths["/api/test/current"]?.get?.deprecated).toBeUndefined();
	});
});
