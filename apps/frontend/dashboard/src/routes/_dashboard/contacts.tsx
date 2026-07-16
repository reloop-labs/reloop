import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ContactsShell } from "#/features/contacts/contacts-shell";

export const Route = createFileRoute("/_dashboard/contacts")({
	component: ContactsLayout,
});

function ContactsLayout() {
	return (
		<ContactsShell>
			<Outlet />
		</ContactsShell>
	);
}
