import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/api-keys")({
	component: () => (
		<PagePlaceholder
			title="API Keys"
			description="API key management will live here."
		/>
	),
});
