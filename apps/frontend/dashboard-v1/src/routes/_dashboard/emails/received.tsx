import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/emails/received")({
	component: () => (
		<PagePlaceholder
			title="Received"
			description="Received emails will live here."
		/>
	),
});
