import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "complaint-rate",
	title: "Complaint Rate",
	description:
		"How often people mark your mail as spam, relative to how much you send.",
	keywords: ["spam complaint rate", "abuse complaint", "FBL complaint"],
	body: `Complaint rate is spam-button presses (and similar abuse signals) divided by sends. Mailbox providers watch this closely. High complaints over time get you filtered or blocked faster than almost any content trick can fix.

You learn about many complaints through feedback loops (FBLs) that ISPs run. Not every provider shares them the same way. Even without a formal FBL, engagement and spam placement act as a shadow signal.

Keep complaints low by mailing only people who asked, making unsubscribe obvious, and matching content to what they signed up for. Purchased lists and “we thought you'd like this” blasts are the usual culprits.

Reloop can surface complaint-related events when providers report them so you can suppress those addresses right away.`,
	relatedTerms: [
		{
			slug: "feedback-loop",
			title: "Feedback Loop",
		},
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
