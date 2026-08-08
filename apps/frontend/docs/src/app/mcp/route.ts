import { type NextRequest, NextResponse } from "next/server";
import { AGENT_CACHE_CONTROL } from "../../lib/agent-headers";
import { type DocsTextFile, loadAllDocsText } from "../../lib/docs-content-fs";

const ORIGIN = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
const SERVER_INFO = {
	name: "reloop-docs",
	version: "1.0.0",
};

const TOOLS = [
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
		annotations: {
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		},
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
		annotations: {
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		},
	},
];

function corsHeaders(): HeadersInit {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers":
			"Content-Type, Accept, Authorization, MCP-Protocol-Version",
		"Cache-Control": AGENT_CACHE_CONTROL,
	};
}

function jsonRpcResult(id: unknown, result: unknown) {
	return NextResponse.json(
		{ jsonrpc: "2.0", id: id ?? null, result },
		{ headers: corsHeaders() },
	);
}

function jsonRpcError(id: unknown, code: number, message: string) {
	return NextResponse.json(
		{ jsonrpc: "2.0", id: id ?? null, error: { code, message } },
		{ headers: corsHeaders() },
	);
}

function normalizePath(path: string): string {
	let p = path.trim();
	p = p.replace(/^https?:\/\/[^/]+/i, "");
	p = p.replace(/^\/docs/, "");
	p = p.replace(/\.mdx?$/i, "");
	if (!p.startsWith("/")) p = `/${p}`;
	if (p === "/" || p === "") p = "/introduction";
	return p.replace(/\/+$/, "") || "/introduction";
}

function searchDocs(query: string, limit: number, pages: DocsTextFile[]) {
	const terms = query
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length > 1);
	if (terms.length === 0) return [];

	const scored = pages
		.map((page) => {
			const hay = `${page.title}\n${page.urlPath}\n${page.body}`.toLowerCase();
			let score = 0;
			for (const term of terms) {
				if (page.title.toLowerCase().includes(term)) score += 10;
				if (page.urlPath.toLowerCase().includes(term)) score += 5;
				const count = hay.split(term).length - 1;
				score += Math.min(count, 20);
			}
			if (score === 0) return null;
			const idx = hay.indexOf(terms[0]!);
			const snippetStart = Math.max(0, idx - 40);
			const snippet = page.body
				.slice(snippetStart, snippetStart + 200)
				.replace(/\s+/g, " ")
				.trim();
			return {
				score,
				title: page.title,
				path: page.urlPath,
				url: `${ORIGIN}/docs${page.urlPath === "/introduction" ? "" : page.urlPath}`,
				markdownUrl: `${ORIGIN}/docs${page.urlPath}.md`,
				snippet,
			};
		})
		.filter(Boolean)
		.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
		.slice(0, limit);

	return scored;
}

function getPage(path: string, pages: DocsTextFile[]) {
	const normalized = normalizePath(path);
	const page =
		pages.find((p) => p.urlPath === normalized) ||
		pages.find(
			(p) =>
				p.urlPath.endsWith(normalized) ||
				p.relPath.replace(/\.mdx?$/, "") === normalized.slice(1),
		);
	if (!page) return null;
	return {
		title: page.title,
		path: page.urlPath,
		url: `${ORIGIN}/docs${page.urlPath === "/introduction" ? "" : page.urlPath}`,
		markdownUrl: `${ORIGIN}/docs${page.urlPath}.md`,
		content: page.body,
	};
}

async function handleRpc(body: {
	jsonrpc?: string;
	id?: unknown;
	method?: string;
	params?: Record<string, unknown>;
}) {
	const id = body.id;
	const method = body.method;
	const params = body.params ?? {};

	if (!method) {
		return jsonRpcError(id, -32600, "Missing method");
	}

	if (method === "initialize") {
		return jsonRpcResult(id, {
			protocolVersion: "2024-11-05",
			capabilities: {
				tools: {},
				resources: {},
			},
			serverInfo: SERVER_INFO,
		});
	}

	if (method === "notifications/initialized" || method === "ping") {
		return jsonRpcResult(id, {});
	}

	if (method === "tools/list") {
		return jsonRpcResult(id, { tools: TOOLS });
	}

	if (method === "resources/list") {
		return jsonRpcResult(id, {
			resources: [
				{
					uri: "reloop://skill.md",
					name: "skill.md",
					description: "Reloop product skill for agents",
					mimeType: "text/markdown",
				},
				{
					uri: "reloop://llms.txt",
					name: "llms.txt",
					description: "Curated documentation index",
					mimeType: "text/plain",
				},
			],
		});
	}

	if (method === "tools/call") {
		const name = params.name as string | undefined;
		const args = (params.arguments ?? {}) as Record<string, unknown>;
		const pages = loadAllDocsText();

		if (name === "search_docs") {
			const query = String(args.query ?? "");
			const limit = Math.min(20, Math.max(1, Number(args.limit) || 8));
			const results = searchDocs(query, limit, pages);
			return jsonRpcResult(id, {
				content: [
					{
						type: "text",
						text: JSON.stringify({ query, results }, null, 2),
					},
				],
			});
		}

		if (name === "get_doc_page") {
			const path = String(args.path ?? "");
			const page = getPage(path, pages);
			if (!page) {
				return jsonRpcResult(id, {
					content: [
						{
							type: "text",
							text: `Page not found: ${path}`,
						},
					],
					isError: true,
				});
			}
			return jsonRpcResult(id, {
				content: [
					{
						type: "text",
						text: `# ${page.title}\n\nURL: ${page.url}\nMarkdown: ${page.markdownUrl}\n\n${page.content}`,
					},
				],
			});
		}

		return jsonRpcError(id, -32601, `Unknown tool: ${name}`);
	}

	return jsonRpcError(id, -32601, `Method not found: ${method}`);
}

export async function OPTIONS() {
	return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
	// Discovery-friendly GET for agents probing the endpoint
	return NextResponse.json(
		{
			name: SERVER_INFO.name,
			version: SERVER_INFO.version,
			transport: "http",
			url: `${ORIGIN}/docs/mcp`,
			description: "Search and retrieve Reloop documentation",
			capabilities: { tools: true, resources: true },
			authentication: "none",
			tools: TOOLS.map((t) => ({
				name: t.name,
				description: t.description,
				inputSchema: t.inputSchema,
				annotations: t.annotations,
			})),
		},
		{ headers: corsHeaders() },
	);
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		// Support batch (array) or single object
		if (Array.isArray(body)) {
			const results = [];
			for (const item of body) {
				const res = await handleRpc(item);
				results.push(await res.json());
			}
			return NextResponse.json(results, { headers: corsHeaders() });
		}
		return handleRpc(body);
	} catch (error) {
		return jsonRpcError(
			null,
			-32700,
			error instanceof Error ? error.message : "Parse error",
		);
	}
}
