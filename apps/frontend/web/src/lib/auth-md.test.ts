import { describe, expect, test } from "bun:test";
import { buildAuthMdContent } from "./auth-md";

describe("buildAuthMdContent", () => {
	test("generates canonical AgentOnboard sections", () => {
		const content = buildAuthMdContent("reloop.sh");

		expect(content).toContain("# Reloop API");
		expect(content).toContain("## Audience");
		expect(content).toContain("`reloop.sh`");
		expect(content).toContain('get_token(domain: "reloop.sh")');

		expect(content).toContain("## Endpoints");
		expect(content).toContain("POST /api/agents/v1/auth/signup");
		expect(content).toContain("GET /api/agents/v1/auth/me");
		expect(content).toContain("POST /api/agents/v1/email/send");

		expect(content).toContain("## When a request is rejected");
		expect(content).toContain("401");
		expect(content).toContain("403");
		expect(content).toContain("ACCOUNT_REQUIRED");
		expect(content).toContain("500");
	});

	test("reflects dynamic host header", () => {
		const content = buildAuthMdContent("local.reloop.sh:3000");

		expect(content).toContain("`local.reloop.sh:3000`");
		expect(content).toContain('get_token(domain: "local.reloop.sh:3000")');
	});
});
