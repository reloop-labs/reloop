import AgentInboxSectionLayout from "#/features/agent-inbox/inbox-root-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/inbox")({
	component: InboxRootRoute,
	head: () => ({
		meta: [
			{ title: "Inbox · Reloop" },
			{
				name: "description",
				content: "Agent email inbox for conversations and drafts.",
			},
		],
	}),
});

function InboxRootRoute() {
	return (
		<AgentInboxSectionLayout>
			<Outlet />
		</AgentInboxSectionLayout>
	);
}
