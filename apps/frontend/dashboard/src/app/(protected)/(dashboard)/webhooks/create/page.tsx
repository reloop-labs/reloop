import { pageMetadata } from "#/app/_lib/page-metadata";
import { CreateWebhookPage } from "./client";

export const metadata = pageMetadata(
	"Create Webhook · Reloop",
	"Register a new webhook endpoint.",
);

export default function CreateWebhookRoute() {
	return <CreateWebhookPage />;
}
