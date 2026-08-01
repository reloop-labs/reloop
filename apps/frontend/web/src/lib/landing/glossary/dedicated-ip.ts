import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dedicated-ip",
	title: "Dedicated IP",
	description:
		"A sending IP used only by your traffic, not shared with other customers.",
	keywords: ["dedicated IP email","exclusive sending IP"],
	body: `A dedicated IP is yours alone for outbound SMTP. Your volume and complaint patterns shape its reputation. That is good when you send steadily and follow best practices. It is painful when you send rarely or spike wildly, because idle or bursty IPs warm poorly.

Shared IPs pool many customers. The ESP polices the pool. Dedicated IPs give isolation and control once you have enough volume and process to keep them healthy.

Most teams start shared and move to dedicated when volume and risk justify the ops work. Reloop's docs and tooling cover authentication and reputation either way.`,
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
