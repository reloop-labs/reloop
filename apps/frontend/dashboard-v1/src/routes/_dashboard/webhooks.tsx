import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/webhooks")({
	component: () => (
		<PagePlaceholder
			title="Webhooks"
			description="Webhook endpoints will live here."
		/>
	),
});
