#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { core } from "./core/index.ts";

const server = new Server(
	{ name: "launch-submitter", version: "0.1.0" },
	{ capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: [
		{
			name: "list_products",
			description: "List local product packs available for directory submission",
			inputSchema: { type: "object", properties: {} },
		},
		{
			name: "list_directories",
			description: "List free launch directories in the local catalog",
			inputSchema: { type: "object", properties: {} },
		},
		{
			name: "plan_submissions",
			description: "Plan which free directories a product qualifies for",
			inputSchema: {
				type: "object",
				properties: {
					productId: { type: "string", description: "Product pack id, e.g. reloop" },
				},
				required: ["productId"],
			},
		},
		{
			name: "run_submissions",
			description:
				"Submit a product to free directories via Playwright. Pauses on captcha/login and notifies the human.",
			inputSchema: {
				type: "object",
				properties: {
					productId: { type: "string" },
					only: {
						type: "array",
						items: { type: "string" },
						description: "Optional directory ids to restrict the run",
					},
					dryRun: { type: "boolean" },
				},
				required: ["productId"],
			},
		},
		{
			name: "get_status",
			description: "Get the latest or a specific run status",
			inputSchema: {
				type: "object",
				properties: {
					runId: { type: "string" },
				},
			},
		},
		{
			name: "resume_submission",
			description: "Resume a paused run after the human solved captcha/login",
			inputSchema: {
				type: "object",
				properties: {
					runId: { type: "string" },
				},
			},
		},
	],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const name = request.params.name;
	const args = (request.params.arguments ?? {}) as Record<string, unknown>;

	try {
		let result: unknown;
		switch (name) {
			case "list_products":
				result = await core.listProducts();
				break;
			case "list_directories":
				result = await core.listDirectories();
				break;
			case "plan_submissions":
				result = await core.planProduct(String(args.productId));
				break;
			case "run_submissions":
				result = core.summarizeRun(
					await core.runSubmissions({
						productId: String(args.productId),
						only: Array.isArray(args.only) ? args.only.map(String) : undefined,
						dryRun: Boolean(args.dryRun),
					}),
				);
				break;
			case "get_status":
				result = await core.getStatus(args.runId ? String(args.runId) : undefined);
				break;
			case "resume_submission":
				result = core.summarizeRun(
					await core.resumeRun(args.runId ? String(args.runId) : undefined),
				);
				break;
			default:
				throw new Error(`Unknown tool: ${name}`);
		}
		return {
			content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
		};
	} catch (err) {
		return {
			isError: true,
			content: [
				{
					type: "text",
					text: err instanceof Error ? err.message : String(err),
				},
			],
		};
	}
});

const transport = new StdioServerTransport();
await server.connect(transport);
