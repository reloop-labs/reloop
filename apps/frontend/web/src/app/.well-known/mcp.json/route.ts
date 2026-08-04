import { NextResponse } from "next/server";

const ORIGIN = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
const SITE_MCP = `${ORIGIN}/mcp`;
const DOCS_MCP = `${ORIGIN}/docs/mcp`;

/** Origin-level MCP discovery for agents that probe `/.well-known/mcp.json`. */
export async function GET() {
	return NextResponse.json(
		{
			version: "1.0.0",
			transport: "http",
			url: SITE_MCP,
			servers: [
				{
					name: "site",
					url: SITE_MCP,
					transport: "http",
					authentication: "none",
					description: "Search Reloop marketing site content",
				},
				{
					name: "docs",
					url: DOCS_MCP,
					transport: "http",
					authentication: "none",
					description: "Search and retrieve Reloop documentation as markdown",
				},
			],
		},
		{
			headers: {
				"Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
			},
		},
	);
}
