import type { WebhookEventDefinition } from "./types";

export const CONTACT_CREATE_WEBHOOK_EVENT = {
	id: "contact.create",
	name: "contact.create",
	category: "contact",
	description: "Triggered when a new contact is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_UPDATE_WEBHOOK_EVENT = {
	id: "contact.update",
	name: "contact.update",
	category: "contact",
	description: "Triggered when a contact is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_DELETE_WEBHOOK_EVENT = {
	id: "contact.delete",
	name: "contact.delete",
	category: "contact",
	description: "Triggered when a contact is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_SUBSCRIBED_WEBHOOK_EVENT = {
	id: "contact.subscribed",
	name: "contact.subscribed",
	category: "contact",
	description: "Triggered when a contact subscribes",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_UNSUBSCRIBED_WEBHOOK_EVENT = {
	id: "contact.unsubscribed",
	name: "contact.unsubscribed",
	category: "contact",
	description: "Triggered when a contact unsubscribes",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_BLOCKED_WEBHOOK_EVENT = {
	id: "contact.blocked",
	name: "contact.blocked",
	category: "contact",
	description: "Triggered when a contact is blocked",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_WEBHOOK_EVENTS = [
	CONTACT_CREATE_WEBHOOK_EVENT,
	CONTACT_UPDATE_WEBHOOK_EVENT,
	CONTACT_DELETE_WEBHOOK_EVENT,
	CONTACT_SUBSCRIBED_WEBHOOK_EVENT,
	CONTACT_UNSUBSCRIBED_WEBHOOK_EVENT,
	CONTACT_BLOCKED_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
