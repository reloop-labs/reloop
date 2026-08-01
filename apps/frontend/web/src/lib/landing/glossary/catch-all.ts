import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "catch-all",
	title: "Catch-all",
	description:
		"A mailbox or server setting that accepts mail for any address at a domain, even ones that do not exist as users.",
	keywords: ["catch-all email","catch all domain","accept all"],
	body: `A catch-all (or accept-all) domain accepts messages for addresses that are not real mailboxes. Mail to sales@, random strings@, and typos all land somewhere instead of bouncing.

That is convenient for small teams and risky for list quality. You cannot tell from SMTP alone whether an address is a real person. Validators often mark catch-all domains as “unknown” because the server accepts everything.

If you market to addresses on catch-all domains, expect more soft noise and fewer clear hard bounces. Prefer confirmed opt-in and engagement signals over “it accepted the RCPT TO.”`,
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "email-validation",
			title: "Email Validation",
		},
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
	],
	relatedFeatureHref: "/features/email-validation",
};
