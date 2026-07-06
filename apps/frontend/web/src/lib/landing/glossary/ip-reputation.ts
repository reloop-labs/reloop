import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "ip-reputation",
	title: "IP Reputation",
	description: "A score assigned to an IP based on sending history and complaints.",
	keywords: [
		"IP reputation email",
		"sender IP reputation",
	],
	body: "Shared IP pools inherit collective reputation. Dedicated IPs and good list hygiene improve deliverability over time.",
	relatedFeatureHref: "/features/deliverability",
};
