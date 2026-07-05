import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { integrationConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
