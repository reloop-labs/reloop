import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-out",
	title: "Opt-out",
	description:
		"The recipient's choice to stop receiving a class of mail, via unsubscribe or similar controls.",
	keywords: ["email opt-out","unsubscribe opt out"],
	body: `Opt-out is the counterpart to opt-in: the person no longer wants that mail stream. Honor it quickly across all systems that might send (ESP, CRM, lifecycle tools). Partial opt-out (“still gets partner blasts”) is how trust ends.

Make the action easy. Hidden unsubscribe links raise spam complaints. One-click list-unsubscribe headers help on bulk mail.

After opt-out, suppress marketing. You may still send essential transactional messages if they are truly required and lawful in your jurisdiction. When in doubt, separate the message types in code.`,
	relatedTerms: [
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
		{
			slug: "list-unsubscribe",
			title: "List-Unsubscribe",
		},
		{
			slug: "opt-in",
			title: "Opt-in",
		},
	],
	relatedFeatureHref: "/docs",
};
