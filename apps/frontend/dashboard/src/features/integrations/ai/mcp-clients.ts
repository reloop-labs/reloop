import type { ComponentType, ReactNode } from "react";
import { CodexIcon, VsCodeIcon } from "./client-icons";

/**
 * MCP clients we document setup for. Each client gets its own page at
 * /integrations/mcp/[clientId].
 */

export type McpClientId =
	| "claude-code"
	| "claude"
	| "cursor"
	| "vscode"
	| "codex"
	| "other";

export type SetupContext = {
	/** Public MCP endpoint, e.g. https://reloop.sh/mcp */
	mcpUrl: string;
	/** Public origin of this Reloop install */
	baseUrl: string;
};

export type SetupStep = {
	title: string;
	body: string;
	code?: { value: string; lang: string; label: string };
	/** Custom block rendered under the step, e.g. prompt cards */
	content?: ReactNode;
};

export type McpClient = {
	id: McpClientId;
	name: string;
	/** Brand mark simple-icons doesn't ship; wins over simpleIconKey */
	customIcon?: ComponentType<{ className?: string }>;
	/** simple-icons export key; falls back to `fallbackIcon` when missing */
	simpleIconKey?: string;
	fallbackIcon: string;
	tagline: string;
	/** One-click install link, for clients that support it */
	installLink?: (ctx: SetupContext) => { label: string; href: string };
	steps: (ctx: SetupContext) => SetupStep[];
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

export const mcpClients: McpClient[] = [
	{
		id: "claude-code",
		name: "Claude Code",
		simpleIconKey: "siClaude",
		fallbackIcon: "terminal",
		tagline: "Anthropic's coding agent in your terminal.",
		steps: ({ mcpUrl }) => [
			{
				title: "Add the Reloop server",
				body: "Run this in your terminal. Add --scope user to make Reloop available in every project.",
				code: {
					value: `claude mcp add --transport http reloop ${mcpUrl}`,
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
		id: "claude",
		name: "Claude",
		simpleIconKey: "siClaude",
		fallbackIcon: "magic-wand",
		tagline: "Claude on the web and the desktop app.",
		steps: ({ mcpUrl }) => [
			{
				title: "Open Connectors",
				body: "In Claude, go to Settings → Connectors and click Add custom connector. On Team and Enterprise plans an owner adds it under Organization settings first.",
			},
			{
				title: "Paste the server URL",
				body: "Name it Reloop and use this URL. Leave the advanced OAuth fields empty; Reloop registers the client automatically.",
				code: { value: mcpUrl, lang: "text", label: "Server URL" },
			},
			{
				title: "Connect",
				body: "Click Connect, sign in to Reloop and approve the workspace. Then turn Reloop on from the tools menu in any chat.",
			},
		],
	},
	{
		id: "cursor",
		name: "Cursor",
		simpleIconKey: "siCursor",
		fallbackIcon: "code",
		tagline: "The AI code editor.",
		installLink: ({ mcpUrl }) => ({
			label: "Add to Cursor",
			href: `cursor://anysphere.cursor-deeplink/mcp/install?name=reloop&config=${encodeURIComponent(
				btoa(JSON.stringify({ url: mcpUrl })),
			)}`,
		}),
		steps: ({ mcpUrl }) => [
			{
				title: "Add the server",
				body: "Use the button above, or add this to .cursor/mcp.json in your project (~/.cursor/mcp.json for every project).",
				code: {
					value: json({ mcpServers: { reloop: { url: mcpUrl } } }),
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
		id: "vscode",
		name: "VS Code",
		customIcon: VsCodeIcon,
		fallbackIcon: "code",
		tagline: "GitHub Copilot agent mode in Visual Studio Code.",
		installLink: ({ mcpUrl }) => ({
			label: "Install in VS Code",
			href: `vscode:mcp/install?${encodeURIComponent(
				JSON.stringify({ name: "reloop", type: "http", url: mcpUrl }),
			)}`,
		}),
		steps: ({ mcpUrl }) => [
			{
				title: "Add the server",
				body: "Use the button above, or add this to .vscode/mcp.json in your workspace.",
				code: {
					value: json({ servers: { reloop: { type: "http", url: mcpUrl } } }),
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
		id: "codex",
		name: "Codex",
		customIcon: CodexIcon,
		fallbackIcon: "terminal",
		tagline: "OpenAI's coding agent CLI and IDE extension.",
		steps: ({ mcpUrl }) => [
			{
				title: "Add the server",
				body: "Add this to ~/.codex/config.toml.",
				code: {
					value: `[mcp_servers.reloop]\nurl = "${mcpUrl}"`,
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
	{
		id: "other",
		name: "Other clients",
		simpleIconKey: "siModelcontextprotocol",
		fallbackIcon: "integration",
		tagline: "Any client that speaks MCP, remote or stdio.",
		steps: ({ mcpUrl, baseUrl }) => [
			{
				title: "Remote (recommended)",
				body: "Point any client with Streamable HTTP support at this URL. It discovers Reloop's OAuth server and signs you in through the browser.",
				code: { value: mcpUrl, lang: "text", label: "Server URL" },
			},
			{
				title: "Local (stdio)",
				body: "For clients that only launch local servers, run reloop-mcp with an API key from the API keys page.",
				code: {
					value: json({
						mcpServers: {
							reloop: {
								command: "npx",
								args: ["-y", "reloop-mcp"],
								env: {
									RELOOP_API_KEY: "YOUR_API_KEY",
									RELOOP_BASE_URL: baseUrl,
								},
							},
						},
					}),
					lang: "json",
					label: "MCP config",
				},
			},
		],
	},
];

export function findMcpClient(id: string): McpClient | undefined {
	return mcpClients.find((client) => client.id === id);
}

/** Public origin of this Reloop install (same resolution as API samples). */
export function resolveBaseUrl(): string {
	const fromEnv = (process.env.NEXT_PUBLIC_URL || "").trim();
	if (fromEnv) return fromEnv.replace(/\/$/, "");
	if (typeof window !== "undefined") return window.location.origin;
	return "";
}
