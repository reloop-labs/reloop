import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "return-path",
	title: "Return-Path",
	description:
		"The address that receives bounces; tied to the SMTP envelope sender.",
	keywords: ["Return-Path","bounce address","envelope from"],
	body: `Return-Path is a header that reflects the envelope MAIL FROM after delivery. Bounce messages go there. ESPs often set a unique return path per campaign or recipient (Variable Envelope Return Path) so they can attribute bounces automatically.

If Return-Path is broken or points at an unmonitored mailbox, you fly blind on failures. SPF is evaluated on the envelope domain, so return-path domains need correct SPF too.

When debugging, look at both the visible From and the Return-Path. They answer different questions.`,
	relatedTerms: [
		{
			slug: "envelope",
			title: "Envelope",
		},
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "spf",
			title: "SPF",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
