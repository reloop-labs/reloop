import { ContactDetailContent } from "#/features/contacts/detail/contact-detail-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/contacts/detail/$contactId")({
	component: ContactDetailRoute,
	head: () => ({
		meta: [
			{ title: "Contact Detail · Reloop" },
			{
				name: "description",
				content: "View and manage contact details.",
			},
		],
	}),
});

function ContactDetailRoute() {
	const { contactId } = Route.useParams();
	return <ContactDetailContent contactId={contactId} />;
}
