import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mta",
	title: "Mail Transfer Agent (MTA)",
	description: "Software that transfers email between servers using SMTP.",
	keywords: ["MTA", "mail transfer agent"],
	body: "Reloop includes a managed MTA layer—you send via API or SMTP without operating Postfix or similar yourself.",
	relatedFeatureHref: "/features/smtp",
};
