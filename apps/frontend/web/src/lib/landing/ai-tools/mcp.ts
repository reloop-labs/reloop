import type { FaqEntry } from "@reloop/web/lib/schema";

/**
 * Reloop MCP server marketing content: /features/mcp and /features/mcp/[client].
 * Setup steps, taglines and prompts mirror the dashboard
 * (apps/frontend/dashboard/src/features/integrations/ai), so keep them in sync.
 */

/** Hosted MCP endpoint. Caddy routes every /mcp* path to the MCP server. */
export const MCP_SERVER_URL = "https://reloop.sh/mcp";

/** Dashboard page where a signed-in user connects a client. */
export const MCP_DASHBOARD_HREF = "/dashboard/integrations/mcp";

export const MCP_DOCS_HREF = "/docs/integrations/ai-tools/mcp-server";

export const MCP_PAGE_PATH = "/features/mcp";

export const MCP_CLIENT_SLUGS = [
	"claude-code",
	"claude",
	"cursor",
	"vscode",
	"codex",
] as const;

export type McpClientSlug = (typeof MCP_CLIENT_SLUGS)[number];

export type McpSetupStep = {
	title: string;
	body: string;
	code?: { value: string; lang: string; label: string };
};

export type McpClientDefinition = {
	slug: McpClientSlug;
	name: string;
	/** Short line under the client name, same as the dashboard */
	tagline: string;
	/** Longer page intro for the hero and meta description */
	intro: string;
	/** Brand color for glows and OG accents */
	accentHex: string;
	/** One-click install link, for clients that support it */
	installLink?: { label: string; href: string };
	steps: McpSetupStep[];
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

export const mcpClients: McpClientDefinition[] = [
	{
		slug: "claude-code",
		name: "Claude Code",
		tagline: "Anthropic's coding agent in your terminal.",
		intro:
			"Add Reloop to Claude Code with one command, sign in through your browser, and send email, manage contacts and check deliverability without leaving the terminal.",
		accentHex: "D97757",
		steps: [
			{
				title: "Add the Reloop server",
				body: "Run this in your terminal. Add --scope user to make Reloop available in every project.",
				code: {
					value: `claude mcp add --transport http reloop ${MCP_SERVER_URL}`,
					lang: "bash",
					label: "Terminal",
				},
			},
			{
				title: "Sign in",
				body: "Start Claude Code, run /mcp, pick reloop and choose Authenticate. Your browser opens so you can approve access to this workspace.",
				code: { value: "/mcp", lang: "text", label: "Claude Code" },
			},
		],
	},
	{
		slug: "claude",
		name: "Claude",
		tagline: "Claude on the web and the desktop app.",
		intro:
			"Add Reloop as a custom connector in Claude on the web or the desktop app. Sign in once and ask Claude to send email, draft campaigns or explain a bounce.",
		accentHex: "D97757",
		steps: [
			{
				title: "Open Connectors",
				body: "In Claude, go to Settings → Connectors and click Add custom connector. On Team and Enterprise plans an owner adds it under Organization settings first.",
			},
			{
				title: "Paste the server URL",
				body: "Name it Reloop and use this URL. Leave the advanced OAuth fields empty; Reloop registers the client automatically.",
				code: { value: MCP_SERVER_URL, lang: "text", label: "Server URL" },
			},
			{
				title: "Connect",
				body: "Click Connect, sign in to Reloop and approve the workspace. Then turn Reloop on from the tools menu in any chat.",
			},
		],
	},
	{
		slug: "cursor",
		name: "Cursor",
		tagline: "The AI code editor.",
		intro:
			"Install Reloop in Cursor with one click, sign in through your browser, and let the agent send test email, set up webhooks and verify domains while you build.",
		accentHex: "000000",
		installLink: {
			label: "Add to Cursor",
			href: `cursor://anysphere.cursor-deeplink/mcp/install?name=reloop&config=${encodeURIComponent(
				btoa(JSON.stringify({ url: MCP_SERVER_URL })),
			)}`,
		},
		steps: [
			{
				title: "Add the server",
				body: "Use the button above, or add this to .cursor/mcp.json in your project (~/.cursor/mcp.json for every project).",
				code: {
					value: json({ mcpServers: { reloop: { url: MCP_SERVER_URL } } }),
					lang: "json",
					label: "mcp.json",
				},
			},
			{
				title: "Sign in",
				body: "Open Cursor Settings → MCP & Integrations and click Connect next to reloop. Approve the workspace in your browser.",
			},
		],
	},
	{
		slug: "vscode",
		name: "VS Code",
		tagline: "GitHub Copilot agent mode in Visual Studio Code.",
		intro:
			"Install Reloop in VS Code with one click and use it from GitHub Copilot agent mode. Sign in through your browser; there is no API key to paste into settings.",
		accentHex: "007ACC",
		installLink: {
			label: "Install in VS Code",
			href: `vscode:mcp/install?${encodeURIComponent(
				JSON.stringify({ name: "reloop", type: "http", url: MCP_SERVER_URL }),
			)}`,
		},
		steps: [
			{
				title: "Add the server",
				body: "Use the button above, or add this to .vscode/mcp.json in your workspace.",
				code: {
					value: json({
						servers: { reloop: { type: "http", url: MCP_SERVER_URL } },
					}),
					lang: "json",
					label: ".vscode/mcp.json",
				},
			},
			{
				title: "Start and sign in",
				body: "Click Start above the server in mcp.json (or run MCP: List Servers). VS Code asks you to sign in to Reloop in the browser.",
			},
		],
	},
	{
		slug: "codex",
		name: "Codex",
		tagline: "OpenAI's coding agent CLI and IDE extension.",
		intro:
			"Add Reloop to Codex with two lines of config and one login command. Then ask Codex to send email, add contacts or read your delivery logs.",
		accentHex: "7A9DFF",
		steps: [
			{
				title: "Add the server",
				body: "Add this to ~/.codex/config.toml.",
				code: {
					value: `[mcp_servers.reloop]\nurl = "${MCP_SERVER_URL}"`,
					lang: "toml",
					label: "config.toml",
				},
			},
			{
				title: "Sign in",
				body: "Run the login command and approve the workspace in your browser.",
				code: {
					value: "codex mcp login reloop",
					lang: "bash",
					label: "Terminal",
				},
			},
		],
	},
];

export function isMcpClientSlug(slug: string): slug is McpClientSlug {
	return (MCP_CLIENT_SLUGS as readonly string[]).includes(slug);
}

export function getMcpClient(slug: string): McpClientDefinition | undefined {
	return mcpClients.find((client) => client.slug === slug);
}

export function mcpClientPath(slug: McpClientSlug) {
	return `${MCP_PAGE_PATH}/${slug}`;
}

/** Example base URL for a self-hosted install. */
export const SELF_HOST_BASE_URL = "https://mail.example.com";

/** Stdio config for clients that only launch local servers. */
export const mcpStdioConfig = json({
	mcpServers: {
		reloop: {
			command: "npx",
			args: ["-y", "reloop-mcp"],
			env: {
				RELOOP_API_KEY: "YOUR_API_KEY",
				RELOOP_BASE_URL: SELF_HOST_BASE_URL,
			},
		},
	},
});

export const mcpHowItWorks = [
	{
		title: "Add the server URL",
		body: "Paste the Reloop server URL into your client, or use its one-click install link.",
		code: MCP_SERVER_URL,
	},
	{
		title: "Sign in with Reloop",
		body: "Your client opens the browser. Sign in and approve the workspace. OAuth handles the token, so there is no API key to copy or rotate.",
	},
	{
		title: "Ask in plain language",
		body: "Ask for what you need. The agent picks the right Reloop tool, runs it against your workspace and tells you what happened.",
	},
];

/** Dashboard areas the MCP server covers, with sprite icon names. */
export const mcpCapabilities = [
	{
		title: "Emails",
		icon: "mail-send",
		body: "Send, batch, schedule and cancel email, and look up any message and its delivery status.",
	},
	{
		title: "Contacts",
		icon: "contacts",
		body: "Add and update contacts, manage custom properties, segments and topic subscriptions.",
	},
	{
		title: "Campaigns",
		icon: "mega-phone",
		body: "Draft a broadcast, pick the audience, schedule it or send it now.",
	},
	{
		title: "Templates",
		icon: "layout",
		body: "Create and edit reusable templates, such as a password reset that matches your brand.",
	},
	{
		title: "Automation",
		icon: "workflow",
		body: "Build workflows that react to events, like a welcome series when someone signs up.",
	},
	{
		title: "Inbox",
		icon: "inbox",
		body: "Read inbound email and attachments, and follow threads in your agent inboxes.",
	},
	{
		title: "Metrics & logs",
		icon: "graph-up",
		body: "Check delivery, bounce and open rates, and read the logs behind a change.",
	},
	{
		title: "Domains",
		icon: "globe",
		body: "Add a sending domain, get the DNS records and check verification.",
	},
	{
		title: "Webhooks & API keys",
		icon: "webhook",
		body: "Create webhooks for delivery and inbound events, and manage API keys.",
	},
];

/** Same prompts as the dashboard MCP page. */
export const mcpPrompts = [
	"Send a welcome email to user@example.com with a personalized greeting.",
	"List all emails I sent today and show their delivery status.",
	"Add a new contact with their name and email.",
	"Create a campaign for our product launch announcement.",
	"Verify my domain and check the DNS configuration status.",
	"Show me all inbound emails I received this week.",
	"Set up a webhook to notify me when an email bounces.",
	"Create a contact group for users who signed up this month.",
	"Send a batch of onboarding emails to these five new users.",
	"Create a password reset email template that matches our brand.",
	"Why did my bounce rate go up yesterday?",
	"Build an automation that sends a welcome series when someone signs up.",
];

export const mcpFaq: FaqEntry[] = [
	{
		question: "What is the Reloop MCP server?",
		answer: `A Model Context Protocol server at ${MCP_SERVER_URL} that connects AI clients to your Reloop workspace. It can do everything you can do in the Reloop dashboard: send email, manage contacts, run campaigns, edit templates, build automations, read the inbox, check metrics and logs, verify domains, and manage webhooks and API keys.`,
	},
	{
		question: "Do I need an API key?",
		answer:
			"Not for the hosted server. Your client signs in with Reloop over OAuth: the browser opens, you approve the workspace, and the client receives a token scoped to it. API keys are only needed when you run reloop-mcp locally over stdio.",
	},
	{
		question: "Which AI clients work with it?",
		answer:
			"Claude Code, Claude (web and desktop), Cursor, VS Code with GitHub Copilot agent mode, and Codex have setup guides. Any client that supports remote MCP servers over Streamable HTTP can connect with the server URL, and clients that only launch local servers can run reloop-mcp over stdio.",
	},
	{
		question: "Can I use it with a self-hosted Reloop install?",
		answer:
			"Yes. Reloop is open source. Point remote clients at the /mcp endpoint of your own install, or run npx -y reloop-mcp with RELOOP_API_KEY set to a key from your install and RELOOP_BASE_URL set to its public URL.",
	},
	{
		question: "Should I use the MCP server or the CLI?",
		answer:
			"Use the MCP server in chat and IDE clients that support MCP, where you ask in plain language. Use the Reloop CLI in shells, CI jobs and agents that run commands: every command takes --json and returns predictable exit codes.",
	},
];
