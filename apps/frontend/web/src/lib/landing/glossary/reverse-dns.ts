import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "reverse-dns",
	title: "Reverse DNS",
	description:
		"A PTR record that maps an IP back to a hostname; receivers check this on SMTP connections.",
	keywords: ["reverse DNS", "PTR record", "rDNS email"],
	body: `Reverse DNS (a PTR record) says which hostname an IP claims. Many receivers check that connecting SMTP clients have plausible PTR data, and that forward DNS for that hostname points back at the IP (FCrDNS).

Cloud VMs often start with generic PTR names. For dedicated sending IPs, set a sensible hostname (for example mta1.mail.yourdomain.com) that matches your HELO/EHLO.

Shared ESP IPs are managed by the provider. If you run your own MTAs, reverse DNS is part of basic sending hygiene next to SPF and DKIM.`,
	relatedTerms: [
		{
			slug: "dns",
			title: "DNS",
		},
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
