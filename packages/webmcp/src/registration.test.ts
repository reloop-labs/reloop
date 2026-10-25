import { describe, expect, test } from "bun:test";
import { buildWebMcpRegistrationScript, toWebMcpSpecs } from "./registration";
import type { WebMcpTool } from "./types";

const tool: WebMcpTool = {
	name: "echo",
	description: "Echoes </script><b>input</b>",
	inputSchema: { type: "object", properties: {} },
	execute: async () => "secret-implementation",
};

describe("WebMCP registration", () => {
	test("specs drop the implementation", () => {
		expect(toWebMcpSpecs([tool])).toEqual([
			{
				name: "echo",
				description: tool.description,
				inputSchema: tool.inputSchema,
			},
		]);
	});

	test("inline script cannot close its <script> tag", () => {
		const script = buildWebMcpRegistrationScript([tool]);
		expect(script).not.toContain("<");
		expect(script).not.toContain("secret-implementation");
		expect(script).toContain('"name":"echo"');
	});
});
