import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { emailAnalyticsConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = featurePageMetadata(
	"Email Analytics",
	"Understand how your emails perform with detailed analytics and real-time reporting.",
	{
		path: "/features/email-analytics",
		keywords: [
			"email analytics",
			"email open rate tracking",
			"email click tracking",
			"email performance reports",
			"real-time email analytics",
			"email campaign metrics",
		],
	},
);

export default function EmailAnalyticsPage() {
	return <FeatureMarketingPage config={emailAnalyticsConfig} />;
}
