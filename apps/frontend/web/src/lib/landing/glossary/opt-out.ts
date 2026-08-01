import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-out",
	title: "Opt-out",
	description:
		"The person's choice to stop receiving a class of mail, via unsubscribe or similar controls.",
	keywords: ["email opt-out","unsubscribe opt out"],
	body: `Opt-out is the counterpart to opt-in: the person no longer wants that mail stream. Honor it quickly across every system that might send (ESP, CRM, lifecycle tools). Partial opt-out that still sends partner blasts is how trust ends.

Make the action easy. Hidden unsubscribe links raise spam complaints. Confirm the change and apply it to suppressions that every sender path checks.

Transactional mail may still be allowed when it is necessary for the account. Say that plainly if users might be confused.`,
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
