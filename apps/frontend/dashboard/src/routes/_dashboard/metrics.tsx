import { MetricsPage } from "#/features/metrics/metrics-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/metrics")({
	component: MetricsPage,
	head: () => ({
		meta: [
			{ title: "Metrics · Reloop" },
			{
				name: "description",
				content: "Deliverability and engagement metrics for your emails.",
			},
		],
	}),
});
