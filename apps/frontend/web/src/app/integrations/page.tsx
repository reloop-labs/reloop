import { LandingIndexPage } from "@reloop/web/components/landing/landing-index-page";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { integrationConfigs } from "@reloop/web/lib/landing/integrations";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Integrations",
	"Send email from Next.js, Laravel, Django, FastAPI, Rails, Spring Boot, Supabase, Vercel, and Stripe.",
	"/integrations",
	["email integration", "Next.js email", "Laravel email API"],
);

export default function IntegrationsIndexPage() {
	const integrations = integrationConfigs;

	return (
		<LandingIndexPage
			titleLines={["Email", "Integrations"]}
			description="Framework and platform guides for sending transactional and marketing email with Reloop."
			items={integrations.map((item) => ({
				title: item.titleLines.join(" "),
				description: item.description,
				href: item.path,
			}))}
			cta={defaultLandingCta(
				"Integrate in minutes",
				"Official SDKs and SMTP relay for every major stack.",
			)}
		/>
	);
}
