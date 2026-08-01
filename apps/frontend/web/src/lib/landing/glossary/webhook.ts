import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "webhook",
	title: "Webhook",
	description:
		"An HTTP callback your app receives when an email event happens (delivered, bounced, clicked).",
	keywords: ["email webhook","delivery webhook","event webhook"],
	body: `Webhooks push events to your HTTPS endpoint as JSON (or similar) when something changes: delivered, bounced, complained, opened, clicked. You avoid polling and can update users or suppressions in near real time.

Secure webhooks with secrets, signature checks, and idempotency. Providers retry on failure; your handler should tolerate duplicates. Respond quickly and process heavy work in the background.

Reloop emits webhooks for delivery lifecycle events so your application stays the source of truth for user-visible state.`,
	relatedTerms: [
		{
			slug: "api",
			title: "API",
		},
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "engagement",
			title: "Engagement",
		},
	],
	relatedFeatureHref: "/features/webhooks",
};
