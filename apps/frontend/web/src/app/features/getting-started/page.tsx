import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { gettingStartedConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Getting Started",
	"Get your email infrastructure up and running in minutes with Reloop.",
	{
		path: "/features/getting-started",
		keywords: [
			"getting started with email API",
			"email API quickstart",
			"Reloop setup guide",
			"send first email API",
			"email infrastructure setup",
		],
	},
);

export default function GettingStartedPage() {
	return <FeatureMarketingPage config={gettingStartedConfig} />;
}
