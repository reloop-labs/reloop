import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { apiReferenceConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"API Reference",
	"RESTful APIs for sending email, managing contacts, and tracking analytics.",
	{
		path: "/features/api-reference",
		keywords: [
			"email API reference",
			"REST email API",
			"email sending API",
			"email API documentation",
			"Reloop API",
			"open source email API",
		],
	},
);

export default function ApiReferencePage() {
	return <FeatureMarketingPage config={apiReferenceConfig} />;
}
