import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "seed-list",
	title: "Seed List",
	description:
		"A set of test inboxes across providers used to observe placement and rendering.",
	keywords: ["email seed list","seed testing","inbox seed"],
	body: `A seed list is a collection of addresses you control at Gmail, Outlook, Yahoo, and others. You BCC or include them on campaigns to see where mail landed and how it rendered. Placement tools automate large seed panels.

Seeds are not real customers. They do not engage like humans. Use them for regression checks after domain, template, or IP changes. Do not optimize solely to make seeds happy while ignoring actual user metrics.

Combine seeds with Postmaster Tools and your own analytics for a fuller picture.`,
	relatedTerms: [
		{
			slug: "inbox-placement",
			title: "Inbox Placement",
		},
		{
			slug: "deliverability",
			title: "Deliverability",
		},
		{
			slug: "email-client",
			title: "Email Client",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
