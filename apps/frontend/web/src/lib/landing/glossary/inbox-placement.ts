import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "inbox-placement",
	title: "Inbox Placement",
	description:
		"Where a delivered message lands: primary inbox, promotions, spam, or elsewhere.",
	keywords: ["inbox placement", "spam folder", "Gmail tab"],
	body: `Inbox placement is more specific than “delivered.” Delivered can mean inbox, promotions tab, updates, or spam. Placement decides whether a human actually sees the mail.

You measure placement with seed tests, panel tools, and postmaster dashboards. Results vary by provider and segment. A campaign can land in Gmail Primary for engaged users and Spam for cold segments.

Improve placement by fixing authentication, list quality, engagement, and send patterns. Content alone rarely fixes a reputation problem.`,
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
