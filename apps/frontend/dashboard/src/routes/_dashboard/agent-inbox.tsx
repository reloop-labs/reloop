import { AgentInboxPage } from "#/features/agent-inbox/agent-inbox-page";
import { AgentInboxProvider } from "#/features/agent-inbox/components/agent-inbox-provider";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/agent-inbox")({
	component: AgentInboxListRoute,
	head: () => ({
		meta: [
			{ title: "Agent Inbox · Reloop" },
			{
				name: "description",
				content: "Manage agent mailbox addresses and open conversations.",
			},
		],
	}),
});

function AgentInboxListRoute() {
	return (
		<AgentInboxProvider>
			<AgentInboxPage />
		</AgentInboxProvider>
	);
}
