import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { deliverabilityConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Deliverability",
	"Ensure your emails reach the inbox with deliverability tools, reputation monitoring, and authentication.",
);

export default function DeliverabilityPage() {
	return <FeatureMarketingPage config={deliverabilityConfig} />;
}
