import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bimi",
	title: "BIMI",
	description:
		"Brand Indicators for Message Identification. Shows your logo in supporting inboxes when authentication passes.",
	keywords: ["BIMI","BIMI logo","email brand logo"],
	body: `BIMI lets supporting mailbox providers display a brand logo next to authenticated mail. Receivers only show the logo when DMARC is solid (typically enforcement with aligned SPF or DKIM) and your BIMI DNS record points at a valid SVG logo.

Some providers also want a Verified Mark Certificate (VMC) for full logo display. Requirements differ by inbox. BIMI does not replace SPF, DKIM, or DMARC; it builds on them.

If you care about brand recognition in the inbox, get DMARC to enforcement first, then add BIMI. Skipping authentication work and hoping the logo appears will not work.`,
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
