import type { WebhookEventDefinition } from "./types";

/** Lifecycle events customers can subscribe to. */
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

export const DOMAIN_VERIFY_WEBHOOK_EVENT = {
	id: "domain.verify",
	name: "domain.verify",
	category: "domain",
	description: "Triggered when a domain's DNS records are verified",
	isActive: true,
} as const satisfies WebhookEventDefinition;

/** REST response tags — not real outbound webhook events. Kept for ID stability. */
export const DOMAIN_LIST_WEBHOOK_EVENT = {
	id: "domain.list",
	name: "domain.list",
	category: "domain",
	description: "Triggered when domains are listed",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_GET_WEBHOOK_EVENT = {
	id: "domain.get",
	name: "domain.get",
	category: "domain",
	description: "Triggered when a domain is retrieved",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_GET_DNS_WEBHOOK_EVENT = {
	id: "domain.dns.get",
	name: "domain.dns.get",
	category: "domain",
	description: "Triggered when a domain's DNS is retrieved",
	isActive: false,
} as const satisfies WebhookEventDefinition;

export const DOMAIN_WEBHOOK_EVENTS = [
	DOMAIN_CREATE_WEBHOOK_EVENT,
	DOMAIN_UPDATE_WEBHOOK_EVENT,
	DOMAIN_DELETE_WEBHOOK_EVENT,
	DOMAIN_UNDELETE_WEBHOOK_EVENT,
	DOMAIN_VERIFY_WEBHOOK_EVENT,
	DOMAIN_LIST_WEBHOOK_EVENT,
	DOMAIN_GET_WEBHOOK_EVENT,
	DOMAIN_GET_DNS_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];
