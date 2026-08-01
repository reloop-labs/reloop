import { GlossaryTermPageView } from "@reloop/web/components/landing/glossary/glossary-term-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { term } from "@reloop/web/lib/landing/glossary/hard-bounce";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	term.title,
	term.description,
	`/glossary/${term.slug}`,
	term.keywords,
);

export default function HardBounceGlossaryPage() {
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
