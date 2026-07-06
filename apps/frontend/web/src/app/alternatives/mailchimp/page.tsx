import { AlternativePageView } from "@reloop/web/components/landing/alternatives/alternative-page-view";
import { config } from "@reloop/web/lib/landing/alternatives/mailchimp";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function MailchimpAlternativePage() {
	return <AlternativePageView config={config} />;
}
