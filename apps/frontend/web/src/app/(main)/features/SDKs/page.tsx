import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { sdksConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"SDKs",
	"Official Reloop client libraries for Node.js, Python, Go, and more.",
);

export default function SDKsPage() {
	return <FeatureMarketingPage config={sdksConfig} />;
}
