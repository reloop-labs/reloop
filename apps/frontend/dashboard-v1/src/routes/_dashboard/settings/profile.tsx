import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/settings/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/profile")({
	component: () => (
		<SettingsPlaceholderPage
			title="Profile"
			description="Your account profile settings will live here."
		/>
	),
});
