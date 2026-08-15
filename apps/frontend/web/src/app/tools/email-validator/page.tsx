import { EmailValidatorPageView } from "@reloop/web/components/landing/tools/email-validator-page";
import { config } from "@reloop/web/lib/landing/tools/email-validator";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function EmailValidatorPage() {
	return <EmailValidatorPageView />;
}
