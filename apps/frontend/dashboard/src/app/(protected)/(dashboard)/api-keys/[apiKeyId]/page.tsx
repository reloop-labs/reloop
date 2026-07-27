import { pageMetadata } from "#/app/_lib/page-metadata";
import { ApiKeyDetailPage } from "./client";

export const metadata = pageMetadata(
	"API Key · Reloop",
	"View and manage a single API key.",
);

export default async function ApiKeyDetailRoute({
	params,
}: {
	params: Promise<{ apiKeyId: string }>;
}) {
	const { apiKeyId } = await params;
	return <ApiKeyDetailPage apiKeyId={apiKeyId} />;
}
