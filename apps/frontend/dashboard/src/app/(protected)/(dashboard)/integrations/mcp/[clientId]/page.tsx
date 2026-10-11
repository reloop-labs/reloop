import { notFound } from "next/navigation";
import { pageMetadata } from "#/app/_lib/page-metadata";
import { findMcpClient } from "#/features/integrations/ai/mcp-clients";
import { McpClientPage } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ clientId: string }>;
}) {
	const { clientId } = await params;
	const client = findMcpClient(clientId);
	return pageMetadata(
		`${client?.name ?? "MCP"} · MCP server · Reloop`,
		`Connect ${client?.name ?? "your MCP client"} to your Reloop workspace.`,
	);
}

export default async function McpClientRoute({
	params,
}: {
	params: Promise<{ clientId: string }>;
}) {
	const { clientId } = await params;
	if (!findMcpClient(clientId)) notFound();
	return <McpClientPage clientId={clientId} />;
}
