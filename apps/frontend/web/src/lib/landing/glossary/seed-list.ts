import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "seed-list",
	title: "Seed List",
	description:
		"A set of test inboxes across providers used to check placement and rendering.",
	keywords: ["email seed list", "seed testing", "inbox seed"],
	body: `A seed list is a collection of addresses you control at Gmail, Outlook, Yahoo, and others. You BCC or include them on campaigns to see where mail landed and how it rendered. Placement tools automate large seed panels.

Seeds are not real customers. They do not engage like humans. Use them for regression checks and creative QA, not as proof that your whole list will see the same placement.

Combine seed results with real engagement and postmaster data. Reloop's spam and deliverability testing helps catch issues before you only notice them in production metrics.`,
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
