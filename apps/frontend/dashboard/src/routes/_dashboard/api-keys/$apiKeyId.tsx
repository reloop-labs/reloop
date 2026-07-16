import { createFileRoute } from "@tanstack/react-router";
import { ApiKeyDetailPage } from "#/features/api-keys/detail/api-key-detail-page";

export const Route = createFileRoute("/_dashboard/api-keys/$apiKeyId")({
	component: ApiKeyDetailRoute,
	head: () => ({
		meta: [
			{ title: "API Key · Reloop" },
			{
				name: "description",
				content: "View and manage a single API key.",
			},
		],
	}),
});

function ApiKeyDetailRoute() {
	const { apiKeyId } = Route.useParams();
	return <ApiKeyDetailPage apiKeyId={apiKeyId} />;
}
