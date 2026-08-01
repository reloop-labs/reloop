import { GlossaryTermPageView } from "@reloop/web/components/landing/glossary/glossary-term-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createGlossaryTermMetadata } from "@reloop/web/lib/landing/glossary/seo";
import { term } from "@reloop/web/lib/landing/glossary/suppression-list";

export const instant = false;

export const metadata = createGlossaryTermMetadata(term);

export default function SuppressionListGlossaryPage() {
	return (
		<GlossaryTermPageView
			term={term}
			cta={defaultLandingCta(
				"Try Reloop free",
				"3,000 emails a month on the Free plan, no credit card. Or self-host from the docs.",
			)}
		/>
	);
}
