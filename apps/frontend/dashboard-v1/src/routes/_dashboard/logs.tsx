import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/logs")({
	component: () => (
		<PagePlaceholder
			title="Logs"
			description="Request and event logs will live here."
		/>
	),
});
