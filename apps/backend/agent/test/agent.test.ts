import { describe, expect, test } from "bun:test";
import { agentApp } from "../src/index";

describe("Reloop Agent API Gateway", () => {
	test("GET /api/agents/health returns ok", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/health", {
				headers: { "user-agent": "test-agent" },
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ status: "ok", service: "agent" });
	});

	test("GET /api/agents/v1/health returns ok with version", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/health", {
				headers: { "user-agent": "test-agent" },
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({
			status: "ok",
			service: "agent",
			version: "1.0.0",
		});
	});

	test("GET /api/agents/openapi/json returns OpenAPI documentation", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/openapi/json", {
				headers: { "user-agent": "test-agent" },
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.info.title).toBe("Reloop Agent API Gateway");
		expect(Array.isArray(json.tags)).toBe(true);
	});

	test("OPTIONS /api/agents/v1/domain/create returns on-demand schema (Progressive Disclosure Layer 2)", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/domain/create", {
				method: "OPTIONS",
				headers: {
					"user-agent": "test-agent",
					"access-control-request-method": "POST",
				},
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.path).toBe("/api/agents/v1/domain/create");
		expect(json.domain).toBe("domain");
		expect(json.request).toBeDefined();
	});

	test("GET /api/agents/v1/email/schema returns domain schemas", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/email/schema", {
				headers: { "user-agent": "test-agent" },
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.domain).toBe("email");
		expect(Array.isArray(json.endpoints)).toBe(true);
		expect(json.endpoints.length).toBeGreaterThan(0);
	});

	test("GET /api/agents/v1/inbox/schema returns inbox schemas", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/inbox/schema", {
				headers: { "user-agent": "test-agent" },
			}),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.domain).toBe("inbox");
		expect(Array.isArray(json.endpoints)).toBe(true);
	});

	test("Protected endpoint rejects request without token with 401 and dual-contract error", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/email/send", {
				method: "POST",
				headers: {
					"user-agent": "test-agent",
					"content-type": "application/json",
				},
				body: JSON.stringify({
					to: "recipient@example.com",
					subject: "Hello",
				}),
			}),
		);
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json.code).toBe("UNAUTHORIZED");
		expect(json.message).toBeDefined();
		expect(json.why).toBeDefined();
		expect(json.fix).toBeDefined();
	});

	test("POST /api/agents/v1/auth/signup rejects request without token with 401", async () => {
		const res = await agentApp.handle(
			new Request("http://localhost/api/agents/v1/auth/signup", {
				method: "POST",
				headers: {
					"user-agent": "test-agent",
					"content-type": "application/json",
				},
				body: JSON.stringify({}),
			}),
		);
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json.code).toBe("UNAUTHORIZED");
		expect(json.why).toContain("AgentOnboard");
	});
});
