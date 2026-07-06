import { GrosoryPageHeader } from "@reloop/web/components/grosory/grosory-page-header";
import { GrosoryPageMain } from "@reloop/web/components/grosory/grosory-page-main";
import { FeatureCta } from "@reloop/web/components/page-shell";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { getGrosoryLinkCount, getGrosorySections } from "@reloop/web/lib/grosory-sections";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	"Grosory — Site Directory",
	"Browse every Reloop page: tools, use cases, alternatives, integrations, features, glossary, blog, and more.",
	"/grosory",
	[
		"Reloop sitemap",
		"site directory",
		"all Reloop pages",
		"email platform pages",
	],
);

export default function GrosoryPage() {
	const sections = getGrosorySections();
	const totalLinks = getGrosoryLinkCount();

	return (
		<div>
			<GrosoryPageHeader totalLinks={totalLinks} />
			<GrosoryPageMain sections={sections} />

			<FeatureCta
				{...defaultLandingCta(
					"Ready to send email?",
					"Pick any page above—or start with a free account.",
				)}
			/>
		</div>
	);
}
