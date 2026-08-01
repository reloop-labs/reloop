import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "greylisting",
	title: "Greylisting",
	description:
		"A temporary deferral of unknown senders so only real MTAs that retry get through.",
	keywords: ["greylisting", "graylisting", "451 greylist"],
	body: `Greylisting is a receiver policy: the first time it sees a new sender/recipient combination, it returns a temporary failure (4xx) and expects a retry later. Legitimate MTAs retry. Many simple spam bots do not.

For senders, greylisting looks like soft bounces or delayed delivery on first contact. Retries with proper backoff usually succeed. Permanent rejection is a different problem.

If first-send latency matters (password resets), use a reputable ESP or IP with good history so greylisting is less common. Still design for retries; the internet is not zero-latency.`,
	relatedTerms: [
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
		{
			slug: "mta",
			title: "MTA",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
