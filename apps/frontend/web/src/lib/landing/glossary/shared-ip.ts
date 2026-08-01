import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "shared-ip",
	title: "Shared IP",
	description:
		"A sending IP used by multiple customers of an ESP or platform.",
	keywords: ["shared IP email","pooled sending IP"],
	body: `Shared IPs carry traffic from many senders. The ESP polices the pool and absorbs some individual spikes. You get simpler onboarding and less warming work at low volume. You also share fate with neighbors if the pool is poorly managed.

Most startups begin on shared IPs. Move to dedicated IPs when volume is high and steady enough to justify isolation and warming effort.

Whether shared or dedicated, your domain reputation and list practices still matter. A shared IP is not a reputation free pass.`,
	relatedTerms: [
		{
			slug: "dedicated-ip",
			title: "Dedicated IP",
		},
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
		{
			slug: "esp",
			title: "ESP",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
