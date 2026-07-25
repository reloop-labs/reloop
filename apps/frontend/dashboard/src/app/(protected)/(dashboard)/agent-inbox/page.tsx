import { pageMetadata } from "#/app/_lib/page-metadata";
import { AgentInboxRouteClient } from "./client";

export const metadata = pageMetadata(
	"Agent Inbox · Reloop",
	"Manage agent mailbox addresses and open conversations.",
);

export default function AgentInboxRoute() {
	return <AgentInboxRouteClient />;
}
