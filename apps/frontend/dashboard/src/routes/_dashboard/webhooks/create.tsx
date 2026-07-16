import { CreateWebhookPage } from "#/features/webhooks/create/create-webhook-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks/create")({
	component: CreateWebhookPage,
	head: () => ({
		meta: [
			{ title: "Create Webhook · Reloop" },
			{
				name: "description",
				content: "Register a new webhook endpoint.",
			},
		],
	}),
});
