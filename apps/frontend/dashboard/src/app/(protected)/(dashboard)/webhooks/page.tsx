import { pageMetadata } from "#/app/_lib/page-metadata";
import { WebhooksPage } from "./client";

export const metadata = pageMetadata(
	"Webhooks · Reloop",
	"Manage webhook endpoints and delivery logs.",
);

export default function WebhooksRoute() {
	return <WebhooksPage />;
}
