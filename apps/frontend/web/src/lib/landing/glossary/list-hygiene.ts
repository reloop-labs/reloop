import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "list-hygiene",
	title: "List Hygiene",
	description: "Regularly cleaning email lists to remove invalid or unengaged subscribers.",
	keywords: [
		"list hygiene",
		"email list cleaning",
	],
	body: "Validate addresses at signup, remove hard bounces, and sunset inactive subscribers. Reloop validation API automates list cleaning.",
	relatedFeatureHref: "/features/email-validation",
};
