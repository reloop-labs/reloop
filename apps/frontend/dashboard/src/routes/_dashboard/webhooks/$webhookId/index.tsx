import { WebhookDetailPage } from "#/features/webhooks/detail/webhook-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks/$webhookId/")({
	component: WebhookDetailRoute,
	head: () => ({
		meta: [
			{ title: "Webhook · Reloop" },
			{
				name: "description",
				content: "View webhook details and delivery history.",
			},
		],
	}),
});

function WebhookDetailRoute() {
	const { webhookId } = Route.useParams();
	return <WebhookDetailPage webhookId={webhookId} />;
}
