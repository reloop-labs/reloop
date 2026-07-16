import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/settings/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/billing")({
	component: () => (
		<SettingsPlaceholderPage
			title="Billing"
			description="Plans, invoices, and payment methods will live here."
		/>
	),
});
