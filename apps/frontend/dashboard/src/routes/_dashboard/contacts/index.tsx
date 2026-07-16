import { createFileRoute } from "@tanstack/react-router";
import { ContactList } from "#/features/contacts/components/contacts/contact-list";

export const Route = createFileRoute("/_dashboard/contacts/")({
	component: ContactList,
	head: () => ({
		meta: [
			{ title: "Contacts · Reloop" },
			{
				name: "description",
				content: "Manage your contacts and audience data.",
			},
		],
	}),
});
