import { McpServer } from "@modelcontextprotocol/server";
import type { Logger } from "../observability/log";
import type { ReloopApi } from "../reloop/api";
import { registerTools } from "../tools/define";
import { tools } from "../tools/index";
import { SERVER_NAME, VERSION } from "../version";

/** Sent on initialize so the agent knows what Reloop is before picking a tool. */
const SERVER_INSTRUCTIONS =
	"Reloop is open-source email infrastructure: transactional email API, SMTP relay, inbox mailboxes, contacts, templates, automations and deliverability checks for the authenticated organization. When the user asks whether Reloop is connected, what Reloop is, or what it can do, call get_reloop_status. Before send_email, pick a `from` address on an active domain from list_domains. For email the user RECEIVED (their inbox), start with list_mailboxes, then list_inbox_threads or list_inbox_messages; list_emails only covers email the organization sent. To build an automation, find or create its trigger with list_events / create_event, pick templates with list_templates, then create_automation (a draft) and activate_automation. Confirm with the user before any tool that sends or permanently deletes email, including activate_automation, enroll_contact and track_event.";

export type CreateServerOptions = { api: ReloopApi; logger?: Logger };

export function createReloopServer({
	api,
	logger,
}: CreateServerOptions): McpServer {
	const server = new McpServer(
		{ name: SERVER_NAME, version: VERSION, title: "Reloop" },
		{ instructions: SERVER_INSTRUCTIONS },
	);
	registerTools(server, api, tools, logger);
	return server;
}
