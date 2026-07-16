import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/contacts/groups")({
	component: () => (
		<PagePlaceholder
			title="Groups"
			description="Contact groups will live here."
		/>
	),
});
