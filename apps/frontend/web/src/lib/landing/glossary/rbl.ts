import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "rbl",
	title: "RBL",
	metaTitle: "What Is an RBL? Realtime Blocklists Explained",
	description:
		"A DNS-based blocklist queried in realtime while mail is handled (Realtime Blackhole List).",
	keywords: ["RBL", "DNSBL", "realtime blackhole list"],
	body: `An RBL (Realtime Blackhole List) is a DNS-based list of IP addresses and domains known for sending spam. Mail servers check it in realtime and reject or score mail from listed senders. RBL is the older name for what is now usually called a DNSBL. You look up a reversed IP (or sometimes a domain) in a special DNS zone; a positive answer means “listed.”

Operators use RBLs with different policies: some reject, some only score. Being listed is a symptom. Fix the cause (spam, open relay, compromised host), then request delisting per the list's process.

If delivery fails with blocklist language in the bounce, identify which list and which IP. Reloop deliverability tooling helps you watch reputation signals around those incidents.`,
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
