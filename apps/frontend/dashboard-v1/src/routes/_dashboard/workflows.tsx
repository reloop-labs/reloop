import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/workflows")({
	component: () => (
		<PagePlaceholder
			title="Workflows"
			description="Automation workflows will live here."
		/>
	),
});
