import { LandingIndexPage } from "@reloop/web/components/landing/landing-index-page";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { useCaseConfigs } from "@reloop/web/lib/landing/use-cases";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Use Cases",
	"Transactional, marketing, automated, AI agent, and inbound email use cases with Reloop.",
	"/use-cases",
	["email use cases", "transactional email", "marketing email API"],
);

export default function UseCasesIndexPage() {
	const useCases = useCaseConfigs;

	return (
		<LandingIndexPage
			titleLines={["Email", "Use Cases"]}
			description="From password resets to AI agent inboxes—Reloop handles every email sending scenario."
			items={useCases.map((uc) => ({
				title: uc.titleLines.join(" "),
				description: uc.description,
				href: uc.path,
			}))}
			cta={defaultLandingCta(
				"One platform for every use case",
				"Transactional, campaigns, SMTP, and webhooks on a single stack.",
			)}
		/>
	);
}
