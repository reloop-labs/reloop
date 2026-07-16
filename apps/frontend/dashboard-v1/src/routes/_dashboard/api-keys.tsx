import { createFileRoute } from "@tanstack/react-router";
import { ApiKeysPage } from "#/features/api-keys/api-keys-page";

export const Route = createFileRoute("/_dashboard/api-keys")({
	component: ApiKeysPage,
	head: () => ({
		meta: [
			{ title: "API Keys · Reloop" },
			{
				name: "description",
				content: "Create and manage API keys for your Reloop workspace.",
			},
		],
	}),
});
