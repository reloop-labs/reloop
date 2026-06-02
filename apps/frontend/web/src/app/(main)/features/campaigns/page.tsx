import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { campaignsConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Campaigns",
	"Create, send, and track powerful email campaigns that drive engagement and conversions.",
);

export default function CampaignsPage() {
	return <FeatureMarketingPage config={campaignsConfig} />;
}
