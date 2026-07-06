import { GlossaryTermPage } from "@reloop/web/components/landing/content-pages";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { term } from "@reloop/web/lib/landing/glossary/unsubscribe";

export const instant = false;

export const metadata = createLandingMetadata(
	term.title,
	term.description,
	`/glossary/${term.slug}`,
	term.keywords,
);

export default function UnsubscribeGlossaryPage() {
	return (
		<GlossaryTermPage
			term={term}
			cta={defaultLandingCta(
				"Put it into practice",
				"Reloop gives you the tools to improve deliverability and send with confidence.",
			)}
		/>
	);
}
