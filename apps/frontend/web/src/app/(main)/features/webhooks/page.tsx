import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { webhooksConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Webhooks",
	"Real-time webhook notifications for email events, delivery status, and user interactions.",
);

export default function WebhooksPage() {
	return <FeatureMarketingPage config={webhooksConfig} />;
}
