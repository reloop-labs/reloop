import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "reputation",
	title: "Sender Reputation",
	description: "A score ISPs assign based on sending practices and engagement.",
	keywords: ["sender reputation", "email reputation"],
	body: "Reputation is built over time through low bounce rates, high engagement, and proper authentication. Reloop monitors reputation signals in the dashboard.",
	relatedFeatureHref: "/features/deliverability",
};
