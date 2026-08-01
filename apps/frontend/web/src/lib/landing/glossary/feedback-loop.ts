import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "feedback-loop",
	title: "Feedback Loop",
	description:
		"A channel where ISPs tell senders when someone marks a message as spam.",
	keywords: ["FBL","feedback loop email","spam complaint FBL"],
	body: `A feedback loop (FBL) is how some ISPs report spam complaints back to senders. When a recipient hits “Report spam,” the ISP may send you a notice (often ARF format) so you can suppress that address and investigate the stream.

Not every provider offers the same FBL access. Registration and formats vary. Even without a formal FBL, rising spam placement and falling engagement are warnings.

When an FBL event arrives, suppress immediately and ask why that person was on the list. Reloop can pass complaint events into your systems when they are available.`,
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
