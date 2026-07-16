import { MailboxLayout } from "#/features/agent-inbox/pages/mailbox-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/inbox/$mailboxId")({
	component: MailboxLayoutRoute,
});

function MailboxLayoutRoute() {
	return (
		<MailboxLayout>
			<Outlet />
		</MailboxLayout>
	);
}
