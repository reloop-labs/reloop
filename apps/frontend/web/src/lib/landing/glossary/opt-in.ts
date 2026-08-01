import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-in",
	title: "Opt-in",
	description:
		"Permission from a person to receive your mail, usually captured through a form or product action.",
	keywords: ["email opt-in","subscribe permission","consent email"],
	body: `Opt-in means the recipient agreed to get mail of a given type. That agreement should be informed: they know who you are and roughly what you will send. Pre-checked boxes and buried fine print create legal and reputation risk.

Store when and how someone opted in. You will need that trail when someone complains. Source-level metadata also helps segment later.

Transactional messages required to deliver a service (receipts, security alerts) rest on a different basis than marketing newsletters. Do not treat them as interchangeable in your code or your policies.`,
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
