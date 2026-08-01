import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bounce-rate",
	title: "Bounce Rate",
	description:
		"The share of sends that failed delivery, usually as a percentage of total attempts in a period.",
	keywords: ["email bounce rate","bounce percentage","delivery failure rate"],
	body: `Bounce rate is failed deliveries divided by total sends for a window you care about (campaign, day, or month). Providers and blocklists use it as a quality signal. A sudden spike often means a bad list import or a broken form.

There is no single “safe” number for every sender, but staying low matters more than chasing a perfect zero. Transactional mail should bounce less than bulk marketing because addresses come from real product usage. Marketing lists age and need hygiene.

Track hard and soft bounces separately if your stack allows it. Soft bounces may resolve; hard bounces should not keep getting mail.

Reloop surfaces bounce metrics in analytics so you can catch list problems before reputation does.`,
	relatedTerms: [
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
