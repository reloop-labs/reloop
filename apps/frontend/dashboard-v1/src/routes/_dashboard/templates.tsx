import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/templates")({
	component: () => (
		<PagePlaceholder
			title="Templates"
			description="Email templates will live here."
		/>
	),
});
