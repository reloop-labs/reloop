import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-in",
	title: "Opt-in",
	description: "Explicit consent from users to receive email communications.",
	keywords: ["email opt-in", "opt-in marketing"],
	body: "Double opt-in (confirm via email) is best practice for marketing lists and required in many jurisdictions.",
	relatedTerms: [
		{
			slug: "opt-out",
			title: "Opt-out",
		},
	],
};
