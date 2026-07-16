import { WebhooksPage } from "#/features/webhooks/webhooks-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks/")({
	component: WebhooksPage,
	head: () => ({
		meta: [
			{ title: "Webhooks · Reloop" },
			{
				name: "description",
				content: "Manage webhook endpoints and delivery logs.",
			},
		],
	}),
});
