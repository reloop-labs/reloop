import { pageMetadata } from "#/app/_lib/page-metadata";
import { ApiKeysPage } from "./client";

export const metadata = pageMetadata(
	"API Keys · Reloop",
	"Create and manage API keys for your Reloop workspace.",
);

export default function ApiKeysRoute() {
	return <ApiKeysPage />;
}
