import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/domain")({
	component: () => (
		<PagePlaceholder
			title="Domain"
			description="Sending domains will live here."
		/>
	),
});
