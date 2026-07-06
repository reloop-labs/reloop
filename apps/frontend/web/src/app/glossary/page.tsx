import { GlossaryPageMain } from "@reloop/web/components/glossary/glossary-page-main";
import {
	FeatureCta,
	MarketingPageShell,
} from "@reloop/web/components/page-shell";
import {
	getGlossaryLinkCount,
	getGlossaryPageDescription,
	getGlossaryPageOgDescription,
	getGlossarySections,
} from "@reloop/web/lib/glossary-sections";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	"Reloop Site Directory: All Pages and Resources",
	getGlossaryPageDescription(getGlossaryLinkCount()),
	"/glossary",
	[
		"Reloop sitemap",
		"site directory",
		"all Reloop pages",
		"email platform pages",
	],
	getGlossaryPageOgDescription(getGlossaryLinkCount()),
);

export default function GlossaryPage() {
	const sections = getGlossarySections();
	const totalLinks = getGlossaryLinkCount();
	const description = getGlossaryPageDescription(totalLinks);

	return (
		<div className="glossary-page">
			<MarketingPageShell
				titleLines={["Glossary"]}
				description={description}
				compactHero
			>
				<GlossaryPageMain sections={sections} />

				<FeatureCta
					{...defaultLandingCta(
						"Ready to send email?",
						"Start free — transactional mail, campaigns, and a full API in one place.",
					)}
				/>
			</MarketingPageShell>
		</div>
	);
}
