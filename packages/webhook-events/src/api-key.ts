import type { WebhookEventDefinition } from "./types";

export const API_KEY_CREATE_WEBHOOK_EVENT = {
	id: "api-key.create",
	name: "api-key.create",
	category: "api-key",
	description: "Triggered when a new API key is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const API_KEY_UPDATE_WEBHOOK_EVENT = {
	id: "api-key.update",
	name: "api-key.update",
	category: "api-key",
	description: "Triggered when an API key is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const API_KEY_DELETE_WEBHOOK_EVENT = {
	id: "api-key.delete",
	name: "api-key.delete",
	category: "api-key",
	description: "Triggered when an API key is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

/** Reserved / not wired as outbound webhooks yet. */
export const API_KEY_REVOKE_WEBHOOK_EVENT = {
	id: "api-key.revoke",
	name: "api-key.revoke",
	category: "api-key",
	description: "Triggered when an API key is revoked",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const API_KEY_RATE_LIMITED_WEBHOOK_EVENT = {
	id: "api-key.rate_limited",
	name: "api-key.rate_limited",
	category: "api-key",
	description: "Triggered when an API key exceeds its rate limit",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const API_KEY_LIST_WEBHOOK_EVENT = {
	id: "api-key.list",
	name: "api-key.list",
	category: "api-key",
	description: "Triggered when API keys are listed",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const API_KEY_GET_WEBHOOK_EVENT = {
	id: "api-key.get",
	name: "api-key.get",
	category: "api-key",
	description: "Triggered when an API key is retrieved",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const API_KEY_WEBHOOK_EVENTS = [
	API_KEY_CREATE_WEBHOOK_EVENT,
	API_KEY_UPDATE_WEBHOOK_EVENT,
	API_KEY_DELETE_WEBHOOK_EVENT,
	API_KEY_REVOKE_WEBHOOK_EVENT,
	API_KEY_RATE_LIMITED_WEBHOOK_EVENT,
	API_KEY_LIST_WEBHOOK_EVENT,
	API_KEY_GET_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
