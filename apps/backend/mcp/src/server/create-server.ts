import { McpServer } from "@modelcontextprotocol/server";
import type { ReloopApi } from "../reloop/api";
import { registerTools } from "../tools/define";
import { tools } from "../tools/index";
import { SERVER_NAME, VERSION } from "../version";

export type CreateServerOptions = { api: ReloopApi };

export function createReloopServer({ api }: CreateServerOptions): McpServer {
	const server = new McpServer({
		name: SERVER_NAME,
		version: VERSION,
		title: "Reloop",
	});
	registerTools(server, api, tools);
	return server;
}
