import { describe, expect, test } from "bun:test";
import { publicWebMcpTools } from "@reloop/web/lib/webmcp/public-tools";

describe("publicWebMcpTools", () => {
	test("tool names are unique snake_case", () => {
		const names = publicWebMcpTools.map((tool) => tool.name);
		expect(new Set(names).size).toBe(names.length);
		for (const name of names) expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
	});

	test("every tool is read-only with an object schema whose required keys exist", () => {
		for (const tool of publicWebMcpTools) {
			expect(tool.annotations?.readOnlyHint).toBe(true);
			expect(tool.description.length).toBeGreaterThan(20);
			const schema = tool.inputSchema as {
				type: string;
				properties: Record<string, unknown>;
				required?: string[];
			};
			expect(schema.type).toBe("object");
			for (const key of schema.required ?? []) {
				expect(schema.properties).toHaveProperty(key);
			}
		}
	});
});
