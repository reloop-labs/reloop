import { type NextRequest, NextResponse } from "next/server";
import { AGENT_CACHE_CONTROL } from "../../../lib/agent-headers";

const ORIGIN = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
const MCP_URL = `${ORIGIN}/docs/mcp`;

export async function GET(_request: NextRequest) {
	const body = {
		version: "1.0.0",
		transport: "http",
		url: MCP_URL,
		servers: [
			{
				name: "public",
				url: MCP_URL,
				transport: "http",
				authentication: "none",
				description: "Search and retrieve Reloop documentation as markdown",
			},
		],
	};

	return NextResponse.json(body, {
		headers: {
			"Cache-Control": AGENT_CACHE_CONTROL,
		},
	});
}
