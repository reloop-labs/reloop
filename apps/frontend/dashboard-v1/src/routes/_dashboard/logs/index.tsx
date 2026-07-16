import { createFileRoute } from "@tanstack/react-router";
import { LogsPage } from "#/features/logs/logs-page";

export const Route = createFileRoute("/_dashboard/logs/")({
	component: LogsPage,
	head: () => ({
		meta: [
			{ title: "Logs · Reloop" },
			{
				name: "description",
				content: "Inspect API request and delivery logs for your workspace.",
			},
		],
	}),
});
