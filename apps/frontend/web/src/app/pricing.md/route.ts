import { NextResponse } from "next/server";
import { injectMarkdownAgentDirective } from "@reloop/web/lib/agent-directive";
import {
	AGENT_CACHE_CONTROL,
	AGENT_CONTENT_SIGNAL,
} from "@reloop/web/lib/agent-headers";
import { buildPricingMarkdown } from "@reloop/web/lib/pricing-md";

export async function GET() {
	const content = injectMarkdownAgentDirective(buildPricingMarkdown());
	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
			"Content-Signal": AGENT_CONTENT_SIGNAL,
		},
	});
}
