import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "rbl",
	title: "RBL",
	description:
		"Realtime Blackhole List. A DNS-based blocklist queried during mail handling.",
	keywords: ["RBL","DNSBL","realtime blackhole list"],
	body: `RBL is an older term for DNS-based blocklists that mail systems query in realtime. You look up a reversed IP (or sometimes a domain) in a special DNS zone; a positive answer means “listed.”

Operators use RBLs with different policies: some reject, some only score. Being listed is a symptom. Fix open relays, spam, or compromised accounts before you request delisting.

If a chunk of your mail suddenly fails with policy text mentioning a list name, check that list's lookup tools and your sending IP history.`,
	relatedTerms: [
		{
			slug: "blocklist",
			title: "Blocklist",
		},
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
		{
			slug: "deliverability",
			title: "Deliverability",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
