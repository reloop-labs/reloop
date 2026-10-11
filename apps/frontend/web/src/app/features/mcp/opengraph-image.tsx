import { MCP_SERVER_URL } from "@reloop/web/lib/landing/ai-tools/mcp";
import {
	aiToolsOgContentType,
	aiToolsOgSize,
	renderAiToolsOgImage,
} from "@reloop/web/lib/landing/ai-tools/og-image";

export const alt = "MCP Server | Reloop";
export const size = aiToolsOgSize;
export const contentType = aiToolsOgContentType;

export default function OpenGraphImage() {
	return renderAiToolsOgImage({
		title: "MCP Server",
		description:
			"Connect any AI agent to Reloop. It can do everything you can do in the dashboard.",
		lines: [
			{
				command: `add ${MCP_SERVER_URL}`,
				detail: "Claude, Cursor, VS Code, Codex and more.",
			},
			{
				command: "sign in with Reloop",
				detail: "OAuth in the browser. No API key.",
			},
			{
				command: "ask in plain language",
				detail: "Emails, contacts, campaigns, domains, logs.",
			},
		],
	});
}
