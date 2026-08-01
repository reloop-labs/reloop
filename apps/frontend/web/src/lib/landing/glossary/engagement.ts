import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "engagement",
	title: "Engagement",
	description:
		"Signals that recipients actually interact with your mail: opens, clicks, replies, and continued reading over time.",
	keywords: ["email engagement","engaged subscribers","engagement rate"],
	body: `Engagement is evidence people want your mail. Providers use it (imperfectly) to decide inbox vs spam. Lists full of never-open addresses drag reputation down even if they do not bounce.

Common practice: segment by recency of opens or clicks, run re-permission campaigns, and suppress long-term inactive addresses. Exact windows depend on your cadence. Weekly newsletters age differently from rare product announcements.

Do not buy engagement. Artificial opens from bots and security scanners cloud the data. Prefer clear CTAs and honest list growth.`,
	relatedTerms: [
		{
			slug: "open-rate",
			title: "Open Rate",
		},
		{
			slug: "click-through-rate",
			title: "Click-through Rate",
		},
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
