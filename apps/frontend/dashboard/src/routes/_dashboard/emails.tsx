import { EmailsShell } from "#/features/emails/emails-shell";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/emails")({
	component: EmailsLayout,
});

function EmailsLayout() {
	return (
		<EmailsShell>
			<Outlet />
		</EmailsShell>
	);
}
