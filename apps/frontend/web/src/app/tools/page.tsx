import { LandingIndexPage } from "@reloop/web/components/landing/landing-index-page";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { toolConfigs } from "@reloop/web/lib/landing/tools";

export const instant = false;

export const metadata = createLandingMetadata(
	"Free Email Tools",
	"Free email validators, deliverability testers, auth checkers, and more.",
	"/tools",
	["free email tools", "email validator", "SPF checker", "deliverability tester"],
);

export default function ToolsIndexPage() {
	const tools = toolConfigs;

	return (
		<LandingIndexPage
			titleLines={["Free Email", "Tools"]}
			description="Validate addresses, test deliverability, check SPF/DKIM/DMARC, and preview emails—all free in your browser."
			items={tools.map((tool) => ({
				title: tool.titleLines.join(" "),
				description: tool.description,
				href: tool.path,
			}))}
			cta={defaultLandingCta(
				"Need production-grade tools?",
				"Reloop includes validation, analytics, and deliverability monitoring in the platform.",
			)}
		/>
	);
}
