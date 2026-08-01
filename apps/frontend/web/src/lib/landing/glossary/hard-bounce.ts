import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "hard-bounce",
	title: "Hard Bounce",
	description:
		"A permanent delivery failure. The address should not be mailed again.",
	keywords: ["hard bounce","permanent bounce","user unknown"],
	body: `A hard bounce means the receiver believes the failure is permanent: mailbox does not exist, domain does not accept mail, or the address is blocked in a final way. SMTP codes in the 5xx range often indicate this, though mapping is not always clean across providers.

Best practice is immediate suppression. Retrying hard bounces wastes volume and signals bad list hygiene. If you re-import an old CRM dump without cleaning, hard bounces spike fast.

Reloop classifies bounce events so you can automate removal from active audiences.`,
	relatedTerms: [
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "suppression-list",
			title: "Suppression List",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
