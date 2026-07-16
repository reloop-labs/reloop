import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "#/features/integrations/integrations-page";

export const Route = createFileRoute("/_dashboard/integrations")({
	component: IntegrationsPage,
	head: () => ({
		meta: [
			{ title: "Integrations · Reloop" },
			{
				name: "description",
				content:
					"Connect Reloop to your stack with native pathways and upcoming platforms.",
			},
		],
	}),
});
