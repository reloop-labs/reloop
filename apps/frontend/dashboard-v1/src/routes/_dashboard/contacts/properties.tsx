import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/contacts/properties")({
	component: () => (
		<PagePlaceholder
			title="Properties"
			description="Contact property definitions will live here."
		/>
	),
});
