import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "ip-reputation",
	title: "IP Reputation",
	description:
		"Trust score for the IP address that hands mail to receiving servers.",
	keywords: ["IP reputation","sending IP score","SMTP IP reputation"],
	body: `Receivers track how mail from each IP behaves: volume patterns, spam complaints, trap hits, and whether the IP is a known residential proxy or cloud range. A brand-new cloud IP looks different from a long-running ESP range.

Shared IPs blend many customers' traffic. Dedicated IPs isolate your behavior. Either way, abrupt spikes from cold IPs cause filtering.

Warm new IPs, keep reverse DNS sensible, and enable authentication. Reloop's deliverability guidance assumes you treat IP reputation as something you build, not something you buy once.`,
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
