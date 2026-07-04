import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { deliverabilityConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Deliverability",
	"Ensure your emails reach the inbox with deliverability tools, reputation monitoring, and authentication.",
	{
		path: "/features/deliverability",
		keywords: [
			"email deliverability",
			"inbox placement",
			"SPF DKIM DMARC",
			"email reputation monitoring",
			"email authentication",
			"improve email deliverability",
			"avoid spam folder",
		],
	},
);

export default function DeliverabilityPage() {
	return <FeatureMarketingPage config={deliverabilityConfig} />;
}
