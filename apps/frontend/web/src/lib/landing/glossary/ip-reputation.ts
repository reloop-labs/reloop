import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "ip-reputation",
	title: "IP Reputation",
	description:
		"How mailbox providers rate a sending IP based on the traffic that leaves it.",
	keywords: ["IP reputation", "sending IP score", "SMTP IP reputation"],
	body: `IP reputation is the trust score for the IP that connects over SMTP. Providers track complaints, volume patterns, blocklist hits, and whether the IP is shared or dedicated. A brand-new IP starts cold and needs warming.

Bad neighbors on a shared IP can hurt you. On a dedicated IP, your own behavior is the whole story. Reverse DNS and authentication should match the IP's role.

Watch postmaster tools and blocklist checks when delivery dips. Reloop's deliverability focus is on the signals and setup you control.`,
	relatedTerms: [
		{
			slug: "dedicated-ip",
			title: "Dedicated IP",
		},
		{
			slug: "shared-ip",
			title: "Shared IP",
		},
		{
			slug: "ip-warming",
			title: "IP Warming",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
