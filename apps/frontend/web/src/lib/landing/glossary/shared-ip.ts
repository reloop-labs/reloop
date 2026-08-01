import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "shared-ip",
	title: "Shared IP",
	description:
		"A sending IP used by many customers of an ESP or platform at once.",
	keywords: ["shared IP email", "pooled sending IP"],
	body: `Shared IPs carry traffic from many senders. The ESP polices the pool and absorbs some individual spikes. You get simpler onboarding and less warming work at low volume. You also share fate with neighbors if the pool is poorly managed.

Most startups begin on shared IPs. Move to dedicated when volume, compliance needs, or isolation justify the cost and warm-up work.

Whether shared or dedicated, authentication and list quality still decide outcomes. Reloop supports solid domain auth on either model.`,
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
