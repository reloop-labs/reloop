import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "content-filtering",
	title: "Content Filtering",
	description:
		"Analysis of email content to determine spam, delivery, or blocking.",
	keywords: ["email content filtering", "spam content filter"],
	body: "ISPs and spam filters scan subject lines, HTML, links, and sender history. Use Reloop's deliverability tools to test content before sending campaigns.",
	relatedFeatureHref: "/tools/deliverability-tester",
};
