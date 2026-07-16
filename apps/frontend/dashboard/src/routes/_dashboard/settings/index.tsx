import { createFileRoute } from "@tanstack/react-router";
import { UsagePage } from "#/features/settings/usage/usage-page";

export const Route = createFileRoute("/_dashboard/settings/")({
	component: UsagePage,
	head: () => ({
		meta: [
			{ title: "Usage · Reloop" },
			{
				name: "description",
				content:
					"Track your plan limits and resource usage for this billing period.",
			},
		],
	}),
});
