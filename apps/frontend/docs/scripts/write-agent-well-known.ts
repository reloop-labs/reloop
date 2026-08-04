/**
 * Static MCP / skills discovery JSON under public/.well-known/
 * Run: bun apps/frontend/docs/scripts/write-agent-well-known.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pub = join(import.meta.dirname, "../public");
const origin = "https://reloop.sh";
const mcpUrl = `${origin}/docs/mcp`;

function write(rel: string, obj: unknown) {
	const path = join(pub, rel);
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`, "utf-8");
	console.log(`wrote public/${rel}`);
}

write(".well-known/mcp.json", {
	version: "1.0.0",
	transport: "http",
	url: mcpUrl,
	servers: [
		{
			name: "public",
			url: mcpUrl,
			transport: "http",
			authentication: "none",
			description: "Search and retrieve Reloop documentation as markdown",
		},
	],
});

write(".well-known/mcp", {
	version: "1.0.0",
	transport: "http",
	url: mcpUrl,
	servers: [
		{
			name: "public",
			url: mcpUrl,
			transport: "http",
			authentication: "none",
		},
	],
});

write(".well-known/skills/index.json", {
	skills: [
		{
			name: "reloop",
			description:
				"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
			files: ["SKILL.md"],
			url: `${origin}/docs/skill.md`,
		},
	],
});

write(".well-known/agent-skills/index.json", {
	$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
	skills: [
		{
			name: "reloop",
			type: "skill-md",
			description:
				"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
			url: `${origin}/docs/.well-known/agent-skills/reloop/SKILL.md`,
		},
	],
});

console.log("Done docs well-known");
