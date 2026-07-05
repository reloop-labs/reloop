import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { sdksConfig } from "@reloop/web/lib/feature-marketing-configs";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = featurePageMetadata(
	"SDKs",
	"Official Reloop client libraries for Node.js, Python, Go, and more.",
	{
		path: "/features/SDKs",
		keywords: [
			"email SDK",
			"Node.js email library",
			"Python email SDK",
			"Go email client",
			"email client library",
			"open source email SDK",
		],
	},
);

export default function SDKsPage() {
	return <FeatureMarketingPage config={sdksConfig} />;
}
