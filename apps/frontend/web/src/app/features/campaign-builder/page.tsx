import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { campaignBuilderConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = featurePageMetadata(
	"Campaign Builder",
	"Design, preview, and send beautiful email campaigns with a visual editor.",
	{
		path: "/features/campaign-builder",
		keywords: [
			"email campaign builder",
			"visual email editor",
			"drag and drop email builder",
			"email template editor",
			"email campaign design tool",
			"open source email builder",
		],
	},
);

export default function CampaignBuilderPage() {
	return <FeatureMarketingPage config={campaignBuilderConfig} />;
}
