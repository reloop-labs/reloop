import { getSiteUrl } from "@reloop/web/lib/site";
import {
	CLI_DOCS_HREF,
	CLI_INIT_COMMAND,
	CLI_PAGE_PATH,
	CLI_SEND_COMMAND,
	CLI_SKILL_COMMAND,
	cliExamples,
	cliFaq,
} from "./cli";
import {
	getMcpClient,
	MCP_DASHBOARD_HREF,
	MCP_DOCS_HREF,
	MCP_PAGE_PATH,
	MCP_SERVER_URL,
	type McpClientDefinition,
	mcpCapabilities,
	mcpClientPath,
	mcpClients,
	mcpFaq,
	mcpHowItWorks,
	mcpPrompts,
	mcpStdioConfig,
} from "./mcp";

/** Markdown twins for the MCP and CLI pages (.md routes + llms-full corpus). */

type AiToolsPage = { title: string; path: string; body: string };

function fence(code: string, lang = "") {
	return [`\`\`\`${lang}`, code, "```"];
}

function faqLines(items: { question: string; answer: string }[]) {
	const lines = ["## FAQ", ""];
	for (const item of items) {
		lines.push(`### ${item.question}`, "", item.answer, "");
	}
	return lines;
}

function clientLinks(origin: string, exclude?: string) {
	return mcpClients
		.filter((client) => client.slug !== exclude)
		.map(
			(client) =>
				`- [Reloop MCP for ${client.name}](${origin}${mcpClientPath(client.slug)})`,
		);
}

export function buildMcpMarkdown(): string {
	const origin = getSiteUrl();
	const lines: string[] = [
		"# Reloop MCP server",
		"",
		"> Connect any AI agent or MCP client to Reloop. It can do everything you can do in the Reloop dashboard.",
		"",
		`HTML: ${origin}${MCP_PAGE_PATH}`,
		`Server URL: ${MCP_SERVER_URL}`,
		`Connect from the dashboard: ${origin}${MCP_DASHBOARD_HREF}`,
		`Docs: ${origin}${MCP_DOCS_HREF}`,
		"",
		"## How it works",
		"",
	];
	mcpHowItWorks.forEach((step, i) => {
		lines.push(`${i + 1}. **${step.title}.** ${step.body}`);
	});
	lines.push("", "## What it can do", "");
	for (const capability of mcpCapabilities) {
		lines.push(`- **${capability.title}**: ${capability.body}`);
	}
	lines.push("", "## Setup by client", "", ...clientLinks(origin), "");
	lines.push("## Ask your agent to…", "");
	for (const prompt of mcpPrompts) {
		lines.push(`- ${prompt}`);
	}
	lines.push(
		"",
		"## Self-host and local (stdio)",
		"",
		"Reloop is open source. Remote clients can use the /mcp endpoint of your own install. Clients that only launch local servers can run reloop-mcp with an API key:",
		"",
		...fence(mcpStdioConfig, "json"),
		"",
		...faqLines(mcpFaq),
	);
	return lines.join("\n");
}

export function buildMcpClientMarkdown(client: McpClientDefinition): string {
	const origin = getSiteUrl();
	const lines: string[] = [
		`# Reloop MCP for ${client.name}`,
		"",
		`> ${client.intro}`,
		"",
		`HTML: ${origin}${mcpClientPath(client.slug)}`,
		`Server URL: ${MCP_SERVER_URL}`,
		`Docs: ${origin}${MCP_DOCS_HREF}`,
		"",
	];
	if (client.installLink) {
		lines.push(
			`One-click install: [${client.installLink.label}](${client.installLink.href})`,
			"",
		);
	}
	lines.push("## Setup", "");
	client.steps.forEach((step, i) => {
		// The HTML page shows the install button above the steps
		const body = step.body.replace(
			"Use the button above",
			"Use the one-click install link above",
		);
		lines.push(`### ${i + 1}. ${step.title}`, "", body, "");
		if (step.code) {
			lines.push(...fence(step.code.value, step.code.lang), "");
		}
	});
	lines.push("## Try a prompt", "");
	for (const prompt of mcpPrompts.slice(0, 6)) {
		lines.push(`- ${prompt}`);
	}
	lines.push(
		"",
		"## Other clients",
		"",
		...clientLinks(origin, client.slug),
		`- [Reloop MCP server overview](${origin}${MCP_PAGE_PATH})`,
		"",
	);
	return lines.join("\n");
}

export function buildCliMarkdown(): string {
	const origin = getSiteUrl();
	const lines: string[] = [
		"# Reloop CLI",
		"",
		"> Send, schedule and receive email from your terminal, CI or a coding agent. Every command supports --json.",
		"",
		`HTML: ${origin}${CLI_PAGE_PATH}`,
		`Docs: ${origin}${CLI_DOCS_HREF}`,
		"",
		"## Install and sign in",
		"",
		...fence(CLI_INIT_COMMAND, "bash"),
		"",
		"## Agent skill",
		"",
		...fence(CLI_SKILL_COMMAND, "bash"),
		"",
		"## Send an email",
		"",
		...fence(CLI_SEND_COMMAND, "bash"),
		"",
	];
	for (const example of cliExamples) {
		lines.push(
			`## ${example.title}`,
			"",
			example.body,
			"",
			...fence(example.code, example.lang ?? "bash"),
			"",
		);
	}
	lines.push(...faqLines(cliFaq));
	return lines.join("\n");
}

/** Resolve a normalized marketing path to its markdown, if it's an AI tools page. */
export function resolveAiToolsMarkdown(path: string): string | null {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	if (normalized === MCP_PAGE_PATH) return buildMcpMarkdown();
	if (normalized === CLI_PAGE_PATH) return buildCliMarkdown();
	const prefix = `${MCP_PAGE_PATH}/`;
	if (normalized.startsWith(prefix)) {
		const client = getMcpClient(normalized.slice(prefix.length));
		if (client) return buildMcpClientMarkdown(client);
	}
	return null;
}

/** All AI tools pages for the marketing corpus (llms-full, site MCP search). */
export function listAiToolsPages(): AiToolsPage[] {
	return [
		{
			title: "Reloop MCP server",
			path: MCP_PAGE_PATH,
			body: buildMcpMarkdown(),
		},
		...mcpClients.map((client) => ({
			title: `Reloop MCP for ${client.name}`,
			path: mcpClientPath(client.slug),
			body: buildMcpClientMarkdown(client),
		})),
		{ title: "Reloop CLI", path: CLI_PAGE_PATH, body: buildCliMarkdown() },
	];
}
