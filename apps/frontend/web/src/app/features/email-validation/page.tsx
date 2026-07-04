import {
	FeatureMarketingPage,
	featurePageMetadata,
} from "@reloop/web/components/feature-marketing-page";
import { emailValidationConfig } from "@reloop/web/lib/feature-marketing-configs";

export const metadata = featurePageMetadata(
	"Email Validation",
	"Verify addresses before you send. Reduce bounces and protect sender reputation.",
	{
		path: "/features/email-validation",
		keywords: [
			"email validation",
			"email verification API",
			"email address validator",
			"reduce email bounces",
			"sender reputation",
			"email list cleaning",
		],
	},
);

export default function EmailValidationPage() {
	return <FeatureMarketingPage config={emailValidationConfig} />;
}
