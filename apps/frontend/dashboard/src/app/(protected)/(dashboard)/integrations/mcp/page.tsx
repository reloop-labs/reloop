import { pageMetadata } from "#/app/_lib/page-metadata";
import { McpPage } from "./client";

export const metadata = pageMetadata(
	"MCP server · Integrations · Reloop",
	"Connect Claude, Cursor, Codex, or any MCP client to your Reloop workspace.",
);

export default function McpRoute() {
	return <McpPage />;
}
