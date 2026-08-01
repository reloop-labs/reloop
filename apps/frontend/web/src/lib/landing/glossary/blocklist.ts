import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "blocklist",
	title: "Blocklist",
	description:
		"A public list of IPs or domains that receivers treat as risky or refuse to accept.",
	keywords: ["email blocklist","blacklist","RBL","DNSBL"],
	body: `A blocklist (also called a blacklist or DNSBL) is a database of IPs or domains flagged for spam, abuse, or bad sending behavior. Receiving servers and filters look these up when mail arrives. A hit can mean quarantine, delay, or a hard reject.

Not every list matters the same. Some are used widely by ISPs; others are niche. Listings often follow spam complaints, open relays, malware, or a sudden blast from a cold IP. Getting off usually means fixing the cause, then asking to be delisted.

Prevention is easier than cleanup: authenticate properly, warm new IPs, keep lists clean, and honor unsubscribes.

If delivery drops, check whether your sending IPs are on major lists. Reloop's deliverability tools help you watch reputation signals next to authentication.`,
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
