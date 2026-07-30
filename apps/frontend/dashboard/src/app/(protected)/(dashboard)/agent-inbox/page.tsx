import { pageMetadata } from "#/app/_lib/page-metadata";
import { AgentInboxRouteClient } from "./client";

export const metadata = pageMetadata(
	"Inbox · Reloop",
	"Manage mailbox addresses and open conversations.",
);

export default function AgentInboxRoute() {
	return <AgentInboxRouteClient />;
}
