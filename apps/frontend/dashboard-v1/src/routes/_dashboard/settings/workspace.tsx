import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/dashboard/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/workspace")({
	component: () => (
		<SettingsPlaceholderPage
			title="Workspace"
			description="Workspace name, logo, and general settings will live here."
		/>
	),
});
