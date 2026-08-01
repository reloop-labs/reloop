import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bounce",
	title: "Bounce",
	description:
		"The receiving server rejected the message, so it never landed in the inbox.",
	keywords: ["email bounce","bounce message","NDR"],
	body: `A bounce means the remote server will not (or cannot) accept the message. You usually see that as an SMTP response during the send, or as a later non-delivery report. Your ESP should turn bounces into events so you can update your list.

There are two useful kinds. Hard bounces are permanent: bad address, domain does not exist, user unknown. Soft bounces are temporary: full mailbox, greylisting, short outage. Retry soft bounces; remove hard ones.

High bounce rates hurt sender reputation. Providers watch them closely. Clean addresses at signup, verify risky lists, and suppress hard-bounced recipients quickly.

Reloop reports bounce events through webhooks and analytics so you can automate suppression without reading raw SMTP logs.`,
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
		{
			slug: "bounce-rate",
			title: "Bounce Rate",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
