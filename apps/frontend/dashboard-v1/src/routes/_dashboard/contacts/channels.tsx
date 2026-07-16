import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/contacts/channels")({
	component: () => (
		<PagePlaceholder
			title="Channels"
			description="Contact channels will live here."
		/>
	),
});
