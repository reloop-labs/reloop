import { LandingIndexPage } from "@reloop/web/components/landing/landing-index-page";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { alternativeConfigs } from "@reloop/web/lib/landing/alternatives";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Provider Alternatives",
	"Open-source alternatives to Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp.",
	"/alternatives",
	["email provider alternative", "Resend alternative", "SendGrid alternative"],
);

export default function AlternativesIndexPage() {
	const alternatives = alternativeConfigs;

	return (
		<LandingIndexPage
			titleLines={["Email Provider", "Alternatives"]}
			description="Self-hostable, open-source email infrastructure as an alternative to proprietary ESPs."
			items={alternatives.map((alt) => ({
				title: alt.titleLines.join(" "),
				description: alt.description,
				href: alt.path,
			}))}
			cta={defaultLandingCta(
				"Try Reloop free",
				"Same developer experience—with ownership of your stack.",
			)}
		/>
	);
}
