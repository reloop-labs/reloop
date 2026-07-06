import { LandingIndexPage } from "@reloop/web/components/landing/landing-index-page";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { personaConfigs } from "@reloop/web/lib/landing/personas";

export const instant = false;

export const metadata = createLandingMetadata(
	"Who Reloop Is For",
	"Email infrastructure for developers, startups, SaaS, agencies, enterprises, and open-source projects.",
	"/for",
	["email for developers", "email for startups", "SaaS email platform"],
);

export default function ForIndexPage() {
	const personas = personaConfigs;

	return (
		<LandingIndexPage
			titleLines={["Built for", "your team"]}
			description="Whether you're a solo developer or an enterprise with compliance needs—Reloop scales with you."
			items={personas.map((persona) => ({
				title: persona.titleLines.join(" "),
				description: persona.description,
				href: persona.path,
			}))}
			cta={defaultLandingCta(
				"Find your fit",
				"Hosted free tier or self-hosted on your infrastructure.",
			)}
		/>
	);
}
