import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "#/features/settings/workspace/workspace-page";

export const Route = createFileRoute("/_dashboard/settings/workspace")({
	component: WorkspacePage,
	head: () => ({
		meta: [
			{ title: "Workspace · Reloop" },
			{
				name: "description",
				content: "Customize your workspace name, logo, and URL slug.",
			},
		],
	}),
});
