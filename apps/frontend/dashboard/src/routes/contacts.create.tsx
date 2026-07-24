import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
import { CreateContactPage } from "#/features/contacts/create/create-contact-page";
import { ActiveOrganizationProvider } from "#/features/dashboard/page-header/use-active-organization";

export const Route = createFileRoute("/contacts/create")({
	component: ContactsCreateRoute,
});

function ContactsCreateRoute() {
	const navigate = useNavigate();
	const { data: session, isPending, isFetched } = useSessionQuery();

	useEffect(() => {
		if (isPending || !isFetched) return;
		if (!session) {
			void navigate({ to: "/login", search: { inviteId: undefined } });
		}
	}, [session, isPending, isFetched, navigate]);

	if (isFetched && !session) {
		return <AuthSessionLoader />;
	}

	return (
		<ActiveOrganizationProvider>
			<CreateContactPage />
		</ActiveOrganizationProvider>
	);
}
