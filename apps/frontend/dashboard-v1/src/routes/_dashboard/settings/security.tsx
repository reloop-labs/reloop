import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/settings/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/security")({
	component: () => (
		<SettingsPlaceholderPage
			title="Security"
			description="Sessions, 2FA, and security preferences will live here."
		/>
	),
});
