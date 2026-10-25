import type { WebMcpTool } from "@reloop/webmcp";

/**
 * Docs tools exposed to in-browser agents via WebMCP. They call the docs MCP
 * server at /docs/mcp, so names, search ranking and output match it exactly.
 */

const readOnly = { readOnlyHint: true } as const;

type McpToolResult = {
	content?: { type: string; text?: string }[];
	isError?: boolean;
};

async function callDocsMcp(
	name: string,
	args: Record<string, unknown>,
	signal?: AbortSignal,
): Promise<string> {
	const res = await fetch("/docs/mcp", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method: "tools/call",
			params: { name, arguments: args },
		}),
		signal,
	});
	if (!res.ok) throw new Error(`Docs request failed (${res.status})`);
	const body = (await res.json()) as {
		result?: McpToolResult;
		error?: { message: string };
	};
	if (body.error) throw new Error(body.error.message);
	const text = (body.result?.content ?? [])
		.map((part) => part.text ?? "")
		.join("\n");
	if (body.result?.isError) throw new Error(text);
	return text;
}

export const docsWebMcpTools: WebMcpTool[] = [
	{
		name: "search_docs",
		description:
			"Search Reloop documentation. Returns matching page titles, paths, and short snippets.",
		inputSchema: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Search query (keywords or phrase)",
				},
				limit: {
					type: "number",
					description: "Max results (default 8, max 20)",
				},
			},
			required: ["query"],
		},
		annotations: readOnly,
		execute: (input, { signal }) => callDocsMcp("search_docs", input, signal),
	},
	{
		name: "get_doc_page",
		description:
			"Fetch a documentation page as markdown. Pass a docs path like /learn/api-keys or learn/ai/api-keys.",
		inputSchema: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "Docs path, e.g. /learn/api-keys or introduction",
				},
			},
			required: ["path"],
		},
		annotations: readOnly,
		execute: (input, { signal }) => callDocsMcp("get_doc_page", input, signal),
	},
	{
		name: "open_doc_page",
		description:
			"Navigate the browser to a documentation page so the user can read it. Pass a docs path from search_docs.",
		inputSchema: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "Docs path, e.g. /learn/api-keys",
				},
			},
			required: ["path"],
		},
		execute: async (input) => {
			const raw = String((input as { path?: string }).path ?? "").trim();
			const path = raw
				.replace(/^https?:\/\/[^/]+/i, "")
				.replace(/^\/?docs(?=\/|$)/, "")
				.replace(/\.mdx?$/i, "")
				.replace(/^\/?/, "/");
			if (path.startsWith("//")) throw new Error(`Invalid docs path: ${raw}`);
			window.location.assign(`/docs${path === "/" ? "" : path}`);
			return JSON.stringify({ opened: `/docs${path}` });
		},
	},
];
