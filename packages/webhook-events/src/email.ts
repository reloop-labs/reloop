import type { WebhookEventDefinition } from "./types";

export const EMAIL_SENT_WEBHOOK_EVENT = {
	id: "email.sent",
	name: "email.sent",
	category: "email",
	description: "Triggered when an email is accepted for delivery",
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
	description: "Triggered when email delivery is delayed (transient failure)",
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
	description: "Triggered when email delivery permanently fails",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_FAILED_WEBHOOK_EVENT = {
	id: "email.failed",
	name: "email.failed",
	category: "email",
	description: "Triggered when an email fails to send due to a permanent error",
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

export const EMAIL_RECEIVED_WEBHOOK_EVENT = {
	id: "email.received",
	name: "email.received",
	category: "email",
	description: "Triggered when an inbound email is successfully received",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_SCHEDULED_WEBHOOK_EVENT = {
	id: "email.scheduled",
	name: "email.scheduled",
	category: "email",
	description: "Triggered when an email is scheduled for later delivery",
	isActive: true,
} as const satisfies WebhookEventDefinition;

/** Not yet wired — hidden until pre-send suppression produces a distinct event. */
export const EMAIL_SUPPRESSED_WEBHOOK_EVENT = {
	id: "email.suppressed",
	name: "email.suppressed",
	category: "email",
	description:
		"Triggered when an email is suppressed (recipient on suppression list)",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const EMAIL_WEBHOOK_EVENTS = [
	EMAIL_SENT_WEBHOOK_EVENT,
	EMAIL_DELIVERED_WEBHOOK_EVENT,
	EMAIL_DELIVERY_DELAYED_WEBHOOK_EVENT,
	EMAIL_COMPLAINED_WEBHOOK_EVENT,
	EMAIL_BOUNCED_WEBHOOK_EVENT,
	EMAIL_FAILED_WEBHOOK_EVENT,
	EMAIL_OPENED_WEBHOOK_EVENT,
	EMAIL_CLICKED_WEBHOOK_EVENT,
	EMAIL_RECEIVED_WEBHOOK_EVENT,
	EMAIL_SCHEDULED_WEBHOOK_EVENT,
	EMAIL_SUPPRESSED_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];

/** Phase-1 wired email events (active + delivered by the pipeline). */
export const EMAIL_ACTIVE_WEBHOOK_EVENTS = EMAIL_WEBHOOK_EVENTS.filter(
	(e) => e.isActive,
);
