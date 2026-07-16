import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "#/features/dashboard/page-placeholder";

export const Route = createFileRoute("/_dashboard/smtp")({
	component: () => (
		<PagePlaceholder
			title="SMTP"
			description="SMTP credentials and setup will live here."
		/>
	),
});
