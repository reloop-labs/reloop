import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/dashboard/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/")({
	component: () => (
		<SettingsPlaceholderPage
			title="Usage"
			description="Workspace usage and limits will live here."
		/>
	),
});
