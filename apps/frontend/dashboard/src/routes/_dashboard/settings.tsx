import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SettingsShell } from "#/features/settings/settings-shell";

export const Route = createFileRoute("/_dashboard/settings")({
	validateSearch: (search: Record<string, unknown>) => ({
		from: typeof search.from === "string" ? search.from : undefined,
	}),
	component: SettingsLayout,
});

function SettingsLayout() {
	return (
		<SettingsShell>
			<Outlet />
		</SettingsShell>
	);
}
