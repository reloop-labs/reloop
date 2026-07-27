import { pageMetadata } from "#/app/_lib/page-metadata";
import { IntegrationsPage } from "./client";

export const metadata = pageMetadata(
	"Integrations · Reloop",
	"Connect Reloop to your stack with native pathways and upcoming platforms.",
);

export default function IntegrationsRoute() {
	return <IntegrationsPage />;
}
