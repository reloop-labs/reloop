import { IntegrationPageView } from "@reloop/web/components/landing/integrations/integration-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/integrations/rails";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function RailsIntegrationPage() {
	return <IntegrationPageView config={config} />;
}
