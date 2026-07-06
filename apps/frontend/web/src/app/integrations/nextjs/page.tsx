import { IntegrationPageView } from "@reloop/web/components/landing/integrations/integration-page-view";
import { config } from "@reloop/web/lib/landing/integrations/nextjs";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function NextjsIntegrationPage() {
	return <IntegrationPageView config={config} />;
}
