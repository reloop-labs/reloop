import { GrosoryPageHeader } from "@reloop/web/components/grosory/grosory-page-header";
import { GrosoryPageMain } from "@reloop/web/components/grosory/grosory-page-main";
import { FeatureCta } from "@reloop/web/components/page-shell";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import {
	getGrosoryLinkCount,
	getGrosoryPageDescription,
	getGrosorySections,
} from "@reloop/web/lib/grosory-sections";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	"Grosory",
	getGrosoryPageDescription(getGrosoryLinkCount()),
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
	const description = getGrosoryPageDescription(totalLinks);

	return (
		<div>
			<GrosoryPageHeader description={description} />
			<GrosoryPageMain sections={sections} />

			<FeatureCta
				{...defaultLandingCta(
					"Ready to send email?",
					"Start free — transactional mail, campaigns, and a full API in one place.",
				)}
			/>
		</div>
	);
}
