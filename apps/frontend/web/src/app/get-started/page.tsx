import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { gettingStartedConfig } from "@reloop/web/lib/feature-marketing-configs";

export const instant = false;

export const metadata = featurePageMetadata(
	"Get Started",
	"Create your Reloop account and send your first email in under five minutes.",
	{
		path: "/get-started",
		keywords: [
			"get started Reloop",
			"Reloop signup",
			"email API setup",
			"start sending email",
		],
	},
);

export default function GetStartedPage() {
	return <FeatureMarketingPage config={gettingStartedConfig} />;
}
