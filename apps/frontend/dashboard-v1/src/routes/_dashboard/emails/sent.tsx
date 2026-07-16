import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/emails/sent")({
	component: () => (
		<PagePlaceholder
			title="Sent"
			description="Sent emails will live here."
		/>
	),
});
