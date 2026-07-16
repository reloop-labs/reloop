import { createFileRoute } from "@tanstack/react-router";
import { TeamsPage } from "#/features/settings/teams/teams-page";

export const Route = createFileRoute("/_dashboard/settings/teams")({
	component: TeamsPage,
	head: () => ({
		meta: [
			{ title: "Teams · Reloop" },
			{
				name: "description",
				content:
					"Manage workspace members, set access levels, and invite new users.",
			},
		],
	}),
});
