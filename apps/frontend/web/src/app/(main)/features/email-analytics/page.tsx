import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { emailAnalyticsConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Analytics",
	"Understand how your emails perform with detailed analytics and real-time reporting.",
);

export default function EmailAnalyticsPage() {
	return <FeatureMarketingPage config={emailAnalyticsConfig} />;
}
