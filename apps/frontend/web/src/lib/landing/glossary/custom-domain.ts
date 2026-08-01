import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "custom-domain",
	title: "Custom Domain",
	description:
		"Sending and tracking email from a domain you own, instead of a shared provider domain.",
	keywords: ["sending domain","email custom domain","from domain"],
	body: `A custom domain means From addresses, tracking links, and authentication records live under a domain you control (for example mail.yourproduct.com). Shared provider domains are easy to start with and harder to brand or fully own reputation on.

Setup usually means verifying the domain, publishing SPF, DKIM, and DMARC, and sometimes CNAMEs for click or open tracking. Align the visible From domain with the authenticated domain so DMARC can pass.

Reloop domain verification issues the DNS records to add and checks them once they propagate.`,
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
