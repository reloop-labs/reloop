import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholderPage } from "#/features/settings/settings-placeholder-page";

export const Route = createFileRoute("/_dashboard/settings/teams")({
	component: () => (
		<SettingsPlaceholderPage
			title="Teams"
			description="Invite members and manage roles will live here."
		/>
	),
});
