import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/metrics")({
	component: () => (
		<PagePlaceholder
			title="Metrics"
			description="Deliverability and engagement metrics will live here."
		/>
	),
});
