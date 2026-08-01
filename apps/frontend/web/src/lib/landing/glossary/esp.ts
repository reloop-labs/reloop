import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "esp",
	title: "ESP",
	description:
		"Email Service Provider. A company or product that sends and manages email on your behalf.",
	keywords: ["email service provider","ESP","email platform"],
	body: `An ESP provides infrastructure and software for outbound email: APIs, SMTP injection, templates, analytics, and compliance tooling. Some focus on marketing campaigns, some on transactional product mail, some on both.

You still own list consent and brand reputation. The ESP owns (or leases) IPs, delivers to the internet, and exposes events. Self-hosting moves more of that stack onto servers you run.

Reloop is open-source email infrastructure with a hosted option at reloop.sh, so you can use managed delivery or run the same codebase yourself.`,
	relatedTerms: [
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "transactional-email",
			title: "Transactional Email",
		},
		{
			slug: "marketing-email",
			title: "Marketing Email",
		},
	],
	relatedFeatureHref: "/pricing",
};
