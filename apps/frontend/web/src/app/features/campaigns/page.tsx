import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { campaignsConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
