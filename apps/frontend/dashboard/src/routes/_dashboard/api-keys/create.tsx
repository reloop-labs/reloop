import { createFileRoute } from "@tanstack/react-router";
import { CreateApiKeyPage } from "#/features/api-keys/create/create-api-key-page";

export const Route = createFileRoute("/_dashboard/api-keys/create")({
	component: CreateApiKeyPage,
	head: () => ({
		meta: [
			{ title: "Create API Key · Reloop" },
			{
				name: "description",
				content: "Create a new API key for your Reloop workspace.",
			},
		],
	}),
});
