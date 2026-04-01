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

export const GROUP_CREATE_WEBHOOK_EVENT = {
	id: "group.create",
	name: "group.create",
	category: "contact",
	description: "Triggered when a new group is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const GROUP_DELETE_WEBHOOK_EVENT = {
	id: "group.delete",
	name: "group.delete",
	category: "contact",
	description: "Triggered when a group is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const TOPIC_CREATE_WEBHOOK_EVENT = {
	id: "topic.create",
	name: "topic.create",
	category: "contact",
	description: "Triggered when a new topic is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const TOPIC_DELETE_WEBHOOK_EVENT = {
	id: "topic.delete",
	name: "topic.delete",
	category: "contact",
	description: "Triggered when a topic is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_CREATE_WEBHOOK_EVENT = {
	id: "property.create",
	name: "property.create",
	category: "contact",
	description: "Triggered when a new property is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_DELETE_WEBHOOK_EVENT = {
	id: "property.delete",
	name: "property.delete",
	category: "contact",
	description: "Triggered when a property is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_WEBHOOK_EVENTS = [
	CONTACT_CREATE_WEBHOOK_EVENT,
	CONTACT_UPDATE_WEBHOOK_EVENT,
	CONTACT_DELETE_WEBHOOK_EVENT,
	CONTACT_SUBSCRIBED_WEBHOOK_EVENT,
	CONTACT_UNSUBSCRIBED_WEBHOOK_EVENT,
	CONTACT_BLOCKED_WEBHOOK_EVENT,
	GROUP_CREATE_WEBHOOK_EVENT,
	GROUP_DELETE_WEBHOOK_EVENT,
	TOPIC_CREATE_WEBHOOK_EVENT,
	TOPIC_DELETE_WEBHOOK_EVENT,
	PROPERTY_CREATE_WEBHOOK_EVENT,
	PROPERTY_DELETE_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
