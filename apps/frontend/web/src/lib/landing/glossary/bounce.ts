import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bounce",
	title: "Bounce",
	description:
		"A delivery failure response from the receiving mail server when a message cannot be accepted.",
	keywords: ["email bounce","bounce message","NDR"],
	body: `A bounce is the remote server saying it will not (or cannot) accept the message. You usually learn this through an SMTP response during the session, or a later non-delivery report. Your ESP should surface bounces as events so you can update your list.

Bounces fall into two practical buckets. Hard bounces mean permanent failure: bad address, domain does not exist, user unknown. Soft bounces mean temporary trouble: full mailbox, greylisting, or a brief outage. Retry soft bounces; remove hard bounces.

High bounce rates damage sender reputation. Mailbox providers watch them closely. Clean addresses at signup, verify risky lists, and suppress hard-bounced recipients quickly.

Reloop reports bounce events through webhooks and analytics so you can automate suppression without guessing from SMTP logs alone.`,
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
