import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/contacts/")({
	component: () => (
		<PagePlaceholder
			title="Contacts"
			description="Audience contacts list will live here."
		/>
	),
});
