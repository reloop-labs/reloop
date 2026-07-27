import { pageMetadata } from "#/app/_lib/page-metadata";
import { CreateApiKeyPage } from "./client";

export const metadata = pageMetadata(
	"Create API Key · Reloop",
	"Create a new API key for your Reloop workspace.",
);

export default function CreateApiKeyRoute() {
	return <CreateApiKeyPage />;
}
