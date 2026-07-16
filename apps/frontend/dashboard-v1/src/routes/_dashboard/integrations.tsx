import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/integrations")({
	component: () => (
		<PagePlaceholder
			title="Integrations"
			description="Third-party integrations will live here."
		/>
	),
});
