import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { developersConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = featurePageMetadata(
	"Developers",
	"Developer-first email infrastructure with APIs, SDKs, and fully-managed SMTP relay.",
	{
		path: "/developers",
		keywords: [
			"developer email API",
			"email SDK",
			"SMTP relay for developers",
			"open source email API",
			"email infrastructure developer tools",
			"resend alternative",
		],
	},
);

export default function DevelopersPage() {
	return <FeatureMarketingPage config={developersConfig} />;
}
