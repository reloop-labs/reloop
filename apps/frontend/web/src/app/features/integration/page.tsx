import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { integrationConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Integrations",
	"Connect Reloop to your stack with REST APIs, webhooks, and official SDKs.",
	{
		path: "/features/integration",
		keywords: [
			"email integrations",
			"email API integration",
			"connect email service",
			"email REST API",
			"email platform integrations",
			"Reloop integrations",
		],
	},
);

export default function IntegrationPage() {
	return <FeatureMarketingPage config={integrationConfig} />;
}
