import { loadMarketingCorpus } from "@reloop/web/lib/agent-content";
import { AGENT_CACHE_CONTROL } from "@reloop/web/lib/agent-headers";
import { getSiteUrl } from "@reloop/web/lib/site";
import { type NextRequest, NextResponse } from "next/server";

const SERVER_INFO = { name: "reloop-web", version: "1.0.0" };

const TOOLS = [
	{
		name: "search_site",
		description:
			"Search Reloop marketing content (home, pricing, blog, about). For product API docs use the docs MCP at /docs/mcp.",
		inputSchema: {
			type: "object",
			properties: {
				query: { type: "string", description: "Search query" },
				limit: { type: "number", description: "Max results (default 8)" },
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
		name: "get_page",
		description:
			"Fetch a marketing page as markdown. Paths like /pricing, /blog/<slug>, /, /about.",
		inputSchema: {
			type: "object",
			properties: {
				path: { type: "string", description: "Site path, e.g. /pricing" },
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

function search(query: string, limit: number) {
	const pages = loadMarketingCorpus();
	const terms = query
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length > 1);
	if (!terms.length) return [];

	const origin = getSiteUrl();
	return pages
		.map((page) => {
			const hay = `${page.title}\n${page.path}\n${page.body}`.toLowerCase();
			let score = 0;
			for (const term of terms) {
				if (page.title.toLowerCase().includes(term)) score += 10;
				if (page.path.toLowerCase().includes(term)) score += 5;
				score += Math.min(hay.split(term).length - 1, 20);
			}
			if (score === 0) return null;
			const idx = hay.indexOf(terms[0]!);
			const snippet = page.body
				.slice(Math.max(0, idx - 40), Math.max(0, idx - 40) + 200)
				.replace(/\s+/g, " ")
				.trim();
			return {
				score,
				title: page.title,
				path: page.path,
				url: `${origin}${page.path === "/" ? "" : page.path}`,
				markdownUrl: `${origin}${page.path === "/" ? "/index" : page.path}.md`,
				snippet,
			};
		})
		.filter(Boolean)
		.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
		.slice(0, limit);
}

async function handleRpc(body: {
	id?: unknown;
	method?: string;
	params?: Record<string, unknown>;
}) {
	const id = body.id;
	const method = body.method;
	const params = body.params ?? {};

	if (!method) return jsonRpcError(id, -32600, "Missing method");

	if (method === "initialize") {
		return jsonRpcResult(id, {
			protocolVersion: "2024-11-05",
			capabilities: { tools: {}, resources: {} },
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
		const origin = getSiteUrl();
		return jsonRpcResult(id, {
			resources: [
				{
					uri: "reloop://skill.md",
					name: "skill.md",
					mimeType: "text/markdown",
					description: "Reloop product skill",
				},
				{
					uri: `${origin}/llms.txt`,
					name: "llms.txt",
					mimeType: "text/plain",
					description: "Site documentation index",
				},
			],
		});
	}

	if (method === "tools/call") {
		const name = params.name as string | undefined;
		const args = (params.arguments ?? {}) as Record<string, unknown>;

		if (name === "search_site") {
			const query = String(args.query ?? "");
			const limit = Math.min(20, Math.max(1, Number(args.limit) || 8));
			const results = search(query, limit);
			return jsonRpcResult(id, {
				content: [
					{ type: "text", text: JSON.stringify({ query, results }, null, 2) },
				],
			});
		}

		if (name === "get_page") {
			const path = String(args.path ?? "/");
			const pages = loadMarketingCorpus();
			const normalized = path.startsWith("/") ? path : `/${path}`;
			const page =
				pages.find((p) => p.path === normalized) ||
				pages.find((p) => p.path === normalized.replace(/\/$/, ""));
			if (!page) {
				return jsonRpcResult(id, {
					content: [{ type: "text", text: `Page not found: ${path}` }],
					isError: true,
				});
			}
			const origin = getSiteUrl();
			return jsonRpcResult(id, {
				content: [
					{
						type: "text",
						text: `# ${page.title}\n\nURL: ${origin}${page.path === "/" ? "" : page.path}\n\n${page.body}`,
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
	const origin = getSiteUrl();
	return NextResponse.json(
		{
			name: SERVER_INFO.name,
			version: SERVER_INFO.version,
			transport: "http",
			url: `${origin}/mcp`,
			description: "Search Reloop marketing site content",
			docsMcp: `${origin}/docs/mcp`,
			capabilities: { tools: true, resources: true },
			authentication: "none",
			tools: TOOLS,
		},
		{ headers: corsHeaders() },
	);
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
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
