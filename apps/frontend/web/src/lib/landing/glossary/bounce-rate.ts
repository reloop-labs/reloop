import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bounce-rate",
	title: "Bounce Rate",
	description:
		"The percentage of emails that failed to deliver in a given period.",
	keywords: ["email bounce rate","bounce percentage","delivery failure rate"],
	body: `Bounce rate is failed deliveries divided by total sends for a window you care about (campaign, day, or month). Providers and blocklists treat it as a quality signal. A sudden spike often means a bad list import or a broken signup form.

There is no single “safe” number for every sender. Staying low matters more than chasing zero. Transactional mail usually bounces less than bulk marketing because addresses come from real product use. Marketing lists age and need cleanup.

If you can, track hard and soft bounces separately. Soft bounces may resolve; hard bounces should not keep getting mail.

Reloop shows bounce metrics in analytics so you can catch list problems before reputation takes the hit.`,
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
