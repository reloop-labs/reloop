import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "greylisting",
	title: "Greylisting",
	description:
		"A temporary rejection that asks well-behaved senders to retry later, filtering one-shot spam bots.",
	keywords: ["greylisting","graylisting","451 greylist"],
	body: `Greylisting is a receiver policy: the first time it sees a new sender/recipient pair, it responds with a temporary failure (often 4xx). Legitimate MTAs queue and retry. Many cheap spam bots never come back.

As a sender, temporary failures are normal. Your MTA or ESP should retry with backoff. Do not treat every 4xx as a hard bounce.

As a receiver, greylisting cuts some junk and delays some real mail, especially one-off messages from new servers. Most bulk infrastructure already retries correctly.`,
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
