import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { campaignsConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Campaigns",
	"Create, send, and track powerful email campaigns that drive engagement and conversions.",
	{
		path: "/features/campaigns",
		keywords: [
			"email campaigns",
			"email marketing campaigns",
			"bulk email sender",
			"campaign analytics",
			"open source email campaigns",
			"email marketing platform",
		],
	},
);

export default function CampaignsPage() {
	return <FeatureMarketingPage config={campaignsConfig} />;
}
