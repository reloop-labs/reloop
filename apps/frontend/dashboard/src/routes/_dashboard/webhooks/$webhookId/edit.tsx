import { EditWebhookPage } from "#/features/webhooks/edit/edit-webhook-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks/$webhookId/edit")({
	component: EditWebhookRoute,
	head: () => ({
		meta: [
			{ title: "Edit Webhook · Reloop" },
			{
				name: "description",
				content: "Update webhook endpoint, description, and events.",
			},
		],
	}),
});

function EditWebhookRoute() {
	const { webhookId } = Route.useParams();
	return <EditWebhookPage webhookId={webhookId} />;
}
