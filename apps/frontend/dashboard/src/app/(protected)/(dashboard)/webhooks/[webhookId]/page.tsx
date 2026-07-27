import { pageMetadata } from "#/app/_lib/page-metadata";
import { WebhookDetailPage } from "./client";

export const metadata = pageMetadata(
	"Webhook · Reloop",
	"View webhook details and delivery history.",
);

export default async function WebhookDetailRoute({
	params,
}: {
	params: Promise<{ webhookId: string }>;
}) {
	const { webhookId } = await params;
	return <WebhookDetailPage webhookId={webhookId} />;
}
