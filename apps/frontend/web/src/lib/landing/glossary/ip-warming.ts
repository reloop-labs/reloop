import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "ip-warming",
	title: "IP Warming",
	description:
		"Gradually increasing send volume on a new IP so providers learn to trust it.",
	keywords: ["IP warming","IP warm up","email warming"],
	body: `IP warming is a schedule: start with low volume to your most engaged recipients, watch bounces and complaints, then step volume up over days or weeks. Providers expect new IPs to ramp. Blasting full volume on day one looks like a hijacked server.

There is no universal calendar. Consumer ISPs are stricter than many corporate gateways. Transactional streams warm differently from bulk newsletters.

Document the plan, stick to engaged cohorts early, and pause if complaints or blocks appear. Switching domains and IPs at the same time multiplies risk.`,
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
