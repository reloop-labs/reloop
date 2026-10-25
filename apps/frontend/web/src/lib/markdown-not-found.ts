import { AGENT_LINK_HEADER } from "@reloop/web/lib/agent-headers";
import { getSiteUrl } from "@reloop/web/lib/site";
import { NextResponse } from "next/server";

/** Markdown 404 body for agents, so they get a useful error instead of HTML. */
export function markdownNotFound(path: string): NextResponse {
	const site = getSiteUrl();
	const body = `# 404 – Page not found

\`${path}\` doesn't exist on ${site.replace(/^https?:\/\//, "")}.

- Home: ${site}/index.md
- Site map: ${site}/sitemap.md
- Docs index for LLMs: ${site}/llms.txt
- Full docs for LLMs: ${site}/llms-full.txt
`;

	return new NextResponse(body, {
		status: 404,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			Link: AGENT_LINK_HEADER,
			"X-Robots-Tag": "noindex",
		},
	});
}
