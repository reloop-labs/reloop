import { WebhookTestPage } from "#/features/webhooks/test/test-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks/$webhookId/test")({
	component: WebhookTestRoute,
	head: () => ({
		meta: [
			{ title: "Test Webhook · Reloop" },
			{
				name: "description",
				content: "Send a test event to this webhook endpoint.",
			},
		],
	}),
});

function WebhookTestRoute() {
	const { webhookId } = Route.useParams();
	return <WebhookTestPage webhookId={webhookId} />;
}
