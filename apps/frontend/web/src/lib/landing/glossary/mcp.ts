import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mcp",
	title: "MCP (Model Context Protocol)",
	description:
		"An open protocol that lets AI models call external tools and read data sources, such as an email API, through a standard server interface.",
	keywords: ["MCP server", "Model Context Protocol", "MCP email"],
	body: `The Model Context Protocol (MCP) is an open standard for connecting AI models to tools and data. An MCP server describes a set of tools with typed inputs; an MCP client (Claude Code, Codex, Cursor, Claude Desktop and others) lists those tools and lets the model call them during a conversation. The model never sees your credentials: the server holds the API key and performs the call.

For email, an MCP server turns "send this invoice to the customer" or "what did the supplier reply?" into API calls the model can make itself, with the results returned as structured data it can reason over.

Reloop publishes reloop-mcp, which exposes sending, received email, contacts, broadcasts, domains, segments, topics, contact properties, API keys, webhooks and templates as MCP tools. Install it with one command per client, for example claude mcp add reloop -e RELOOP_API_KEY=rl_xxx -- npx -y reloop-mcp. The docs site also runs an MCP endpoint for searching documentation.`,
	relatedTerms: [
		{ slug: "agent-inbox", title: "Agent Inbox" },
		{ slug: "api", title: "API" },
	],
	relatedFeatureHref: "/features/ai-agents",
};
