import { getSiteUrl } from "@reloop/fe-docs/lib/site";
import { AGENT_CACHE_CONTROL } from "../../lib/agent-headers";
import { loadAllDocsText } from "../../lib/docs-content-fs";

/** Section llms.txt for /docs: every docs page grouped by section, linked as markdown. */
export function GET() {
	const site = getSiteUrl();
	const sections = new Map<string, string[]>();

	for (const page of loadAllDocsText().sort((a, b) =>
		a.urlPath.localeCompare(b.urlPath),
	)) {
		const section = page.urlPath.split("/")[1] || "introduction";
		const line = `- [${page.title}](${site}/docs${page.urlPath}.md)`;
		sections.set(section, [...(sections.get(section) ?? []), line]);
	}

	const title = (slug: string) =>
		slug === "api"
			? "API"
			: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

	const body = [
		"# Reloop Docs",
		"",
		"> Reloop product documentation: email API, SMTP, domains, contacts, templates, automations, webhooks, agent inboxes and self-hosting. Every page has a markdown twin.",
		"",
		`Site index: ${site}/llms.txt`,
		`Curated docs map: ${site}/llms-docs.txt`,
		`Full docs corpus: ${site}/llms-full-docs.txt`,
		`OpenAPI spec: ${site}/openapi.json`,
		`Docs MCP: ${site}/docs/mcp`,
		"",
		...[...sections].flatMap(([section, lines]) => [
			`## ${title(section)}`,
			"",
			...lines,
			"",
		]),
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
		},
	});
}
