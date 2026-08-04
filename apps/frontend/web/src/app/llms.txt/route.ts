import { NextResponse } from "next/server";
import {
	AGENT_CACHE_CONTROL,
	AGENT_CONTENT_SIGNAL,
} from "@reloop/web/lib/agent-headers";
import { readWebAppFile } from "@reloop/web/lib/agent-content";

export async function GET() {
	const content = readWebAppFile("llms.txt");
	if (!content) {
		return new NextResponse("llms.txt not found", { status: 404 });
	}
	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
			"Content-Signal": AGENT_CONTENT_SIGNAL,
		},
	});
}
