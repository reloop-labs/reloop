import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "blocklist",
	title: "Blocklist",
	description:
		"A published list of IPs or domains that receiving systems treat as high risk or refuse outright.",
	keywords: ["email blocklist","blacklist","RBL","DNSBL"],
	body: `A blocklist (also called a blacklist or DNSBL) is a database of IPs or domains flagged for spam, abuse, or poor sending behavior. Receiving MTAs and filters query these lists when mail arrives. A hit can mean quarantine, delayed delivery, or a hard reject.

Not every listing is equal. Some lists are widely used by ISPs; others are niche. Getting listed often follows spam complaints, open relays, malware, or sudden volume from a cold IP. Getting off usually requires fixing the root cause, then requesting delisting.

Prevention beats cleanup: authenticate properly, warm new IPs, keep lists clean, and honor unsubscribes.

If deliverability drops, check whether your sending IPs appear on major lists. Reloop's deliverability tooling helps you monitor reputation signals alongside authentication.`,
	relatedTerms: [
		{
			slug: "rbl",
			title: "RBL",
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
