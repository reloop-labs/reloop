import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/emails/")({
	component: () => (
		<PagePlaceholder
			title="Emails"
			description="Email activity overview will live here."
		/>
	),
});
