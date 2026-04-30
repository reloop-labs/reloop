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
	id: "contact.group.create",
	name: "contact.group.create",
	category: "contact",
	description: "Triggered when a new group is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const GROUP_DELETE_WEBHOOK_EVENT = {
	id: "contact.group.delete",
	name: "contact.group.delete",
	category: "contact",
	description: "Triggered when a group is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const GROUP_UPDATE_WEBHOOK_EVENT = {
	id: "contact.group.update",
	name: "contact.group.update",
	category: "contact",
	description: "Triggered when a group is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CHANNEL_CREATE_WEBHOOK_EVENT = {
	id: "contact.channel.create",
	name: "contact.channel.create",
	category: "contact",
	description: "Triggered when a new channel is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CHANNEL_DELETE_WEBHOOK_EVENT = {
	id: "contact.channel.delete",
	name: "contact.channel.delete",
	category: "contact",
	description: "Triggered when a channel is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CHANNEL_UPDATE_WEBHOOK_EVENT = {
	id: "contact.channel.update",
	name: "contact.channel.update",
	category: "contact",
	description: "Triggered when a channel is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_CREATE_WEBHOOK_EVENT = {
	id: "contact.property.create",
	name: "contact.property.create",
	category: "contact",
	description: "Triggered when a new property is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_DELETE_WEBHOOK_EVENT = {
	id: "contact.property.delete",
	name: "contact.property.delete",
	category: "contact",
	description: "Triggered when a property is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_UPDATE_WEBHOOK_EVENT = {
	id: "contact.property.update",
	name: "contact.property.update",
	category: "contact",
	description: "Triggered when a property is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_LIST_WEBHOOK_EVENT = {
	id: "contact.list",
	name: "contact.list",
	category: "contact",
	description: "Triggered when contacts are listed",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const GROUP_LIST_WEBHOOK_EVENT = {
	id: "contact.group.list",
	name: "contact.group.list",
	category: "contact",
	description: "Triggered when groups are listed",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CHANNEL_LIST_WEBHOOK_EVENT = {
	id: "contact.channel.list",
	name: "contact.channel.list",
	category: "contact",
	description: "Triggered when channels are listed",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const PROPERTY_LIST_WEBHOOK_EVENT = {
	id: "contact.property.list",
	name: "contact.property.list",
	category: "contact",
	description: "Triggered when properties are listed",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CONTACT_GET_WEBHOOK_EVENT = {
	id: "contact.get",
	name: "contact.get",
	category: "contact",
	description: "Triggered when a contact is retrieved",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const GROUP_GET_WEBHOOK_EVENT = {
	id: "contact.group.get",
	name: "contact.group.get",
	category: "contact",
	description: "Triggered when a group is retrieved",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const CHANNEL_GET_WEBHOOK_EVENT = {
	id: "contact.channel.get",
	name: "contact.channel.get",
	category: "contact",
	description: "Triggered when a channel is retrieved",
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
	GROUP_UPDATE_WEBHOOK_EVENT,
	GROUP_DELETE_WEBHOOK_EVENT,
	CHANNEL_CREATE_WEBHOOK_EVENT,
	CHANNEL_UPDATE_WEBHOOK_EVENT,
	CHANNEL_DELETE_WEBHOOK_EVENT,
	PROPERTY_CREATE_WEBHOOK_EVENT,
	PROPERTY_UPDATE_WEBHOOK_EVENT,
	PROPERTY_DELETE_WEBHOOK_EVENT,
	CONTACT_LIST_WEBHOOK_EVENT,
	GROUP_LIST_WEBHOOK_EVENT,
	CHANNEL_LIST_WEBHOOK_EVENT,
	PROPERTY_LIST_WEBHOOK_EVENT,
	CONTACT_GET_WEBHOOK_EVENT,
	GROUP_GET_WEBHOOK_EVENT,
	CHANNEL_GET_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
