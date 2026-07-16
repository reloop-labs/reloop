import { WorkflowsPage } from "#/features/workflows/workflows-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/workflows/")({
	component: WorkflowsPage,
	head: () => ({
		meta: [
			{ title: "Workflows · Reloop" },
			{
				name: "description",
				content: "Build automation workflows for email and agent events.",
			},
		],
	}),
});
