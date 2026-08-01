import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "custom-domain",
	title: "Custom Domain",
	description:
		"Sending and tracking mail from a domain you own, not a shared provider domain.",
	keywords: ["sending domain", "email custom domain", "from domain"],
	body: `A custom domain means From addresses, tracking links, and auth records live under a domain you control (for example mail.yourproduct.com). Shared provider domains are easy to start with and harder to brand or fully own reputation on.

Setup usually means verifying the domain, publishing SPF/DKIM/DMARC, and pointing tracking hosts where needed. Pick a subdomain for sending if you want to isolate risk from your root website domain.

Reloop supports custom domain verification so your product brand shows up in the From line and authentication lines up with that domain.`,
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dkim",
			title: "DKIM",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
	],
	relatedFeatureHref: "/docs",
};
