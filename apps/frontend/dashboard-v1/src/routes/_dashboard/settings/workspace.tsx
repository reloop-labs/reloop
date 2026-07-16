import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/settings/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/workspace")({
	component: () => (
		<SettingsPlaceholderPage
			title="Workspace"
			description="Workspace name, logo, and general settings will live here."
		/>
	),
});
