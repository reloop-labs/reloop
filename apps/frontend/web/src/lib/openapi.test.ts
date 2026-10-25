import { describe, expect, test } from "bun:test";
import {
	addDeprecationHeaders,
	addErrorModel,
	supportsIdempotencyKey,
} from "@reloop/web/lib/openapi";

describe("supportsIdempotencyKey", () => {
	test("covers write services and skips secret-returning creates", () => {
		expect(supportsIdempotencyKey("/api/mail/v1/send")).toBe(true);
		expect(supportsIdempotencyKey("/api/contacts/create")).toBe(true);
		expect(supportsIdempotencyKey("/api/webhook/v1/")).toBe(false);
		expect(supportsIdempotencyKey("/api/inbox/v1/webhooks/")).toBe(false);
		expect(supportsIdempotencyKey("/api/api-key/v1/")).toBe(false);
		expect(supportsIdempotencyKey("/api/tools/v1/spam-check")).toBe(false);
	});
});

describe("addErrorModel", () => {
	test("points error responses at Error and keeps message constants", () => {
		const paths = {
			"/api/x": {
				post: {
					requestBody: {},
					responses: {
						"200": { description: "ok" },
						"401": {
							content: {
								"application/json": {
									schema: {
										properties: {
											message: { const: "Authentication required" },
										},
									},
								},
							},
						},
						"404": {
							content: {
								"application/json": {
									schema: { properties: { message: { type: "string" } } },
								},
							},
						},
					},
				},
			},
		};
		addErrorModel(paths);
		const responses = paths["/api/x"].post.responses as Record<
			string,
			Record<string, unknown>
		>;
		const schemaOf = (code: string) =>
			(responses[code]?.content as Record<string, { schema: unknown }>)[
				"application/json"
			]?.schema;
		expect(schemaOf("401")).toEqual({
			allOf: [
				{ $ref: "#/components/schemas/Error" },
				{
					type: "object",
					properties: { message: { const: "Authentication required" } },
				},
			],
		});
		expect(schemaOf("404")).toEqual({ $ref: "#/components/schemas/Error" });
		expect(responses["422"]).toEqual({
			$ref: "#/components/responses/ValidationError",
		});
		expect(responses["429"]).toBeDefined();
		expect(responses["500"]).toBeDefined();
		expect(responses["200"]).toEqual({ description: "ok" });
	});
});

describe("addDeprecationHeaders", () => {
	test("documents Deprecation and Sunset only on deprecated operations", () => {
		const paths = {
			"/old": { get: { deprecated: true, responses: { "200": {} } } },
			"/new": { get: { responses: { "200": {} } } },
		};
		addDeprecationHeaders(paths);
		const old = paths["/old"].get.responses["200"] as {
			headers?: Record<string, unknown>;
		};
		const current = paths["/new"].get.responses["200"] as {
			headers?: Record<string, unknown>;
		};
		expect(Object.keys(old.headers ?? {})).toEqual(["Deprecation", "Sunset"]);
		expect(current.headers).toBeUndefined();
	});
});
