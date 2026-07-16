import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/agent-inbox")({
	component: () => (
		<PagePlaceholder
			title="Agent Inbox"
			description="Agent mailbox and conversations will live here."
		/>
	),
});
