import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "ip-warming",
	title: "IP Warming",
	description:
		"Gradually raising send volume on a new or cold IP so providers learn to trust it.",
	keywords: ["IP warming","IP warm up","email warming"],
	body: `IP warming is a plan to ramp volume on a new or idle sending IP. You start with low volume to your most engaged recipients, then increase over days or weeks while watching bounces and complaints.

Skipping warm-up and blasting full volume from a cold IP often lands you in spam or on blocklists. Warming is not magic; content and consent still matter.

Document a schedule, stick to engaged segments early, and pause if complaint or bounce rates spike. Reloop docs cover auth and reputation practices that sit next to any warm-up plan.`,
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
			slug: "engagement",
			title: "Engagement",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
