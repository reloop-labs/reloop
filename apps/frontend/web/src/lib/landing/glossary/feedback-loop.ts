import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "feedback-loop",
	title: "Feedback Loop",
	description:
		"A program where ISPs tell senders when a recipient marks a message as spam.",
	keywords: ["FBL","feedback loop email","spam complaint FBL"],
	body: `A feedback loop (FBL) sends complaint data from an ISP back to the sender or ESP. When a user hits “Report spam,” you eventually get an event identifying the campaign or address (format varies by provider).

Not every mailbox provider offers a classic FBL, and signup processes differ. Where FBLs exist, wire them into suppression immediately. Mailing someone who already spam-buttoned you is how complaint rates climb.

Reloop processes complaint-style events when they are available so those recipients stop receiving mail.`,
	relatedTerms: [
		{
			slug: "complaint-rate",
			title: "Complaint Rate",
		},
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
		{
			slug: "suppression-list",
			title: "Suppression List",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
