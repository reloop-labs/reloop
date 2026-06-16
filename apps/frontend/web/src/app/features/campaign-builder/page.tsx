import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { campaignBuilderConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Campaign Builder",
	"Design, preview, and send beautiful email campaigns with a visual editor.",
);

export default function CampaignBuilderPage() {
	return <FeatureMarketingPage config={campaignBuilderConfig} />;
}
