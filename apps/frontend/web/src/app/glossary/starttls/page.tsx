import { GlossaryTermPageView } from "@reloop/web/components/landing/glossary/glossary-term-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { term } from "@reloop/web/lib/landing/glossary/starttls";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	term.title,
	term.description,
	`/glossary/${term.slug}`,
	term.keywords,
);

export default function StarttlsGlossaryPage() {
	return (
		<GlossaryTermPageView
			term={term}
			cta={defaultLandingCta(
				"Put it into practice",
				"Reloop gives you the tools to improve deliverability and send with confidence.",
			)}
		/>
	);
}
