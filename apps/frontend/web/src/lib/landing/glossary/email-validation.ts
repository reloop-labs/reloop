import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "email-validation",
	title: "Email Validation",
	description:
		"Checking whether an address looks real and is safe to send to, before you mail it.",
	keywords: ["email validation","email verification","syntax check email"],
	body: `Validation ranges from cheap syntax checks (does it look like an email?) to DNS and SMTP probes that ask whether the domain and mailbox might accept mail. No method is perfect. Catch-all domains accept everything. Some servers block probes.

Use validation at signup and before importing old lists. It will not fix consent problems. An address can be valid and still unwanted.

Reloop includes email validation so you can reject obvious bad input early and protect reputation downstream.`,
	relatedTerms: [
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "catch-all",
			title: "Catch-all",
		},
	],
	relatedFeatureHref: "/features/email-validation",
};
