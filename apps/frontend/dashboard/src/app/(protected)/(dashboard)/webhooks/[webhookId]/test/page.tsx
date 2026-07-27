import { pageMetadata } from "#/app/_lib/page-metadata";
import { WebhookTestPage } from "./client";

export const metadata = pageMetadata(
	"Test Webhook · Reloop",
	"Send a test event to this webhook endpoint.",
);

export default async function WebhookTestRoute({
	params,
}: {
	params: Promise<{ webhookId: string }>;
}) {
	const { webhookId } = await params;
	return <WebhookTestPage webhookId={webhookId} />;
}
