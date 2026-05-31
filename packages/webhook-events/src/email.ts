import type { WebhookEventDefinition } from "./types";

export const EMAIL_SENT_WEBHOOK_EVENT = {
	id: "email.sent",
	name: "email.sent",
	category: "email",
	description: "Triggered when an email is sent successfully",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_DELIVERED_WEBHOOK_EVENT = {
	id: "email.delivered",
	name: "email.delivered",
	category: "email",
	description: "Triggered when an email is delivered to the recipient",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_DELIVERY_DELAYED_WEBHOOK_EVENT = {
	id: "email.delivery_delayed",
	name: "email.delivery_delayed",
	category: "email",
	description: "Triggered when email delivery is delayed",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_COMPLAINED_WEBHOOK_EVENT = {
	id: "email.complained",
	name: "email.complained",
	category: "email",
	description: "Triggered when a recipient marks an email as spam",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_BOUNCED_WEBHOOK_EVENT = {
	id: "email.bounced",
	name: "email.bounced",
	category: "email",
	description: "Triggered when email delivery fails",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_OPENED_WEBHOOK_EVENT = {
	id: "email.opened",
	name: "email.opened",
	category: "email",
	description: "Triggered when a recipient opens an email",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_CLICKED_WEBHOOK_EVENT = {
	id: "email.clicked",
	name: "email.clicked",
	category: "email",
	description: "Triggered when a recipient clicks a link in an email",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_WEBHOOK_EVENTS = [
	EMAIL_SENT_WEBHOOK_EVENT,
	EMAIL_DELIVERED_WEBHOOK_EVENT,
	EMAIL_DELIVERY_DELAYED_WEBHOOK_EVENT,
	EMAIL_COMPLAINED_WEBHOOK_EVENT,
	EMAIL_BOUNCED_WEBHOOK_EVENT,
	EMAIL_OPENED_WEBHOOK_EVENT,
	EMAIL_CLICKED_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
