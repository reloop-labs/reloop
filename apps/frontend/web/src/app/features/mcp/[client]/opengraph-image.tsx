import {
	getMcpClient,
	MCP_SERVER_URL,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import {
	aiToolsOgContentType,
	aiToolsOgSize,
	renderAiToolsOgImage,
} from "@reloop/web/lib/landing/ai-tools/og-image";

export const alt = "Reloop MCP server";
export const size = aiToolsOgSize;
export const contentType = aiToolsOgContentType;

export default async function Image({
	params,
}: {
	params: Promise<{ client: string }>;
}) {
	const { client: slug } = await params;
	const client = getMcpClient(slug);
	const name = client?.name ?? "your AI client";

	return renderAiToolsOgImage({
		title: `MCP for ${name}`,
		description: `Connect ${name} to Reloop. Sign in with OAuth, then manage email in plain language.`,
		section: "MCP",
		lines: [
			{
				command: client?.installLink
					? client.installLink.label.toLowerCase()
					: `add ${MCP_SERVER_URL}`,
				detail: client?.tagline ?? "Any client that speaks MCP.",
			},
			{
				command: "sign in with Reloop",
				detail: "Approve the workspace. No API key.",
			},
			{
				command: "send a welcome email",
				detail: "Everything you can do in the dashboard.",
			},
		],
	});
}
