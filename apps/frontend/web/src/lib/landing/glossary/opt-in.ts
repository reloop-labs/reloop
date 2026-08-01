import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-in",
	title: "Opt-in",
	description:
		"Permission from a person to receive your mail, usually from a form or product action.",
	keywords: ["email opt-in","subscribe permission","consent email"],
	body: `Opt-in means the recipient agreed to get mail of a given type. That agreement should be clear: they know who you are and roughly what you will send. Pre-checked boxes and buried fine print create legal and reputation risk.

Store when and how someone opted in. You will need that if someone disputes a send or you run a re-permission campaign.

Marketing opt-in is not the same as agreeing to transactional mail required to use a product. Keep those categories separate in product and legal copy.`,
	relatedTerms: [
		{
			slug: "double-opt-in",
			title: "Double Opt-in",
		},
		{
			slug: "opt-out",
			title: "Opt-out",
		},
		{
			slug: "marketing-email",
			title: "Marketing Email",
		},
	],
	relatedFeatureHref: "/docs",
};
