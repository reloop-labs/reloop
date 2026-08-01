import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "inbox-placement",
	title: "Inbox Placement",
	description:
		"Whether accepted mail lands in the primary inbox, a promotions tab, or spam.",
	keywords: ["inbox placement","spam folder","Gmail tab"],
	body: `Inbox placement is finer than “delivered.” The receiving system accepted the message, then decided where the UI should show it. Promotions tabs, clutter views, and spam folders are still “delivered” in a narrow SMTP sense and still fail your product goal.

Seed lists and panel tests estimate placement across providers. Results vary by region and account history. Use them for large shifts in template or domain, not as daily panic metrics.

Authentication, reputation, and engagement drive placement more than clever subject-line folklore.`,
	relatedTerms: [
		{
			slug: "deliverability",
			title: "Deliverability",
		},
		{
			slug: "seed-list",
			title: "Seed List",
		},
		{
			slug: "engagement",
			title: "Engagement",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
