import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { webhooksConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = featurePageMetadata(
	"Webhooks",
	"Real-time webhook notifications for email events, delivery status, and user interactions.",
	{
		path: "/features/webhooks",
		keywords: [
			"email webhooks",
			"email event notifications",
			"delivery status webhook",
			"email tracking webhook",
			"real-time email events",
			"open source email webhooks",
		],
	},
);

export default function WebhooksPage() {
	return <FeatureMarketingPage config={webhooksConfig} />;
}
