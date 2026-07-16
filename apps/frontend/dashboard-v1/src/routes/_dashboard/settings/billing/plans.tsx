import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "#/features/settings/billing/plans-page";

export const Route = createFileRoute("/_dashboard/settings/billing/plans")({
	component: PlansPage,
	head: () => ({
		meta: [
			{ title: "Plans · Reloop" },
			{
				name: "description",
				content: "Compare Reloop plans and request upgrades.",
			},
		],
	}),
});
