import type { WebhookEventDefinition } from "./types";

export const DOMAIN_CREATE_WEBHOOK_EVENT = {
	id: "domain.create",
	name: "domain.create",
	category: "domain",
	description: "Triggered when a new domain is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_UPDATE_WEBHOOK_EVENT = {
	id: "domain.update",
	name: "domain.update",
	category: "domain",
	description: "Triggered when a domain is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_DELETE_WEBHOOK_EVENT = {
	id: "domain.delete",
	name: "domain.delete",
	category: "domain",
	description: "Triggered when a domain is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_UNDELETE_WEBHOOK_EVENT = {
	id: "domain.undelete",
	name: "domain.undelete",
	category: "domain",
	description: "Triggered when a domain is undeleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_WEBHOOK_EVENTS = [
	DOMAIN_CREATE_WEBHOOK_EVENT,
	DOMAIN_UPDATE_WEBHOOK_EVENT,
	DOMAIN_DELETE_WEBHOOK_EVENT,
	DOMAIN_UNDELETE_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
