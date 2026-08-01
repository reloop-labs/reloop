import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bimi",
	title: "BIMI",
	description:
		"Shows your brand logo next to messages in some inboxes when authentication passes.",
	keywords: ["BIMI","BIMI logo","email brand logo"],
	body: `BIMI (Brand Indicators for Message Identification) lets some mailbox providers show your logo next to authenticated mail. The logo only appears when DMARC is in good shape (usually enforcement with aligned SPF or DKIM) and your BIMI DNS record points at a valid SVG logo.

Some providers also want a Verified Mark Certificate (VMC) before they show the logo. Rules differ by inbox. BIMI does not replace SPF, DKIM, or DMARC; it sits on top of them.

If you want the logo, get DMARC to enforcement first, then add BIMI. Skipping the auth work will not make the logo show up.`,
	relatedTerms: [
		{
			slug: "dmarc",
			title: "DMARC",
		},
		{
			slug: "dkim",
			title: "DKIM",
		},
		{
			slug: "authentication",
			title: "Authentication",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
