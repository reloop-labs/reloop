import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { developersConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Developers",
	"Developer-first email infrastructure with APIs, SDKs, and fully-managed SMTP relay.",
);

export default function DevelopersPage() {
	return <FeatureMarketingPage config={developersConfig} />;
}
