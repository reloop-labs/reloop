import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dedicated-ip",
	title: "Dedicated IP",
	description:
		"A sending IP address used only by your traffic, not shared with other customers.",
	keywords: ["dedicated IP email","exclusive sending IP"],
	body: `A dedicated IP is yours alone for outbound SMTP. Your volume and complaint patterns shape its reputation. That is good when you send consistently and follow best practices. It is costly when you send rarely or spike wildly, because idle or bursty IPs warm poorly.

Shared IPs pool many senders. The provider absorbs some variance; you also inherit some neighbor risk. Dedicated IPs make sense at higher, steady volume with staff who watch reputation.

New dedicated IPs need warming: start low, send to engaged recipients, and scale gradually. Reloop supports hosted sending patterns where IP strategy is part of the platform setup.`,
	relatedTerms: [
		{
			slug: "shared-ip",
			title: "Shared IP",
		},
		{
			slug: "ip-warming",
			title: "IP Warming",
		},
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
