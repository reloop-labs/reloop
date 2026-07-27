import { pageMetadata } from "#/app/_lib/page-metadata";
import { EditWebhookPage } from "./client";

export const metadata = pageMetadata(
	"Edit Webhook · Reloop",
	"Update webhook endpoint, description, and events.",
);

export default async function EditWebhookRoute({
	params,
}: {
	params: Promise<{ webhookId: string }>;
}) {
	const { webhookId } = await params;
	return <EditWebhookPage webhookId={webhookId} />;
}
