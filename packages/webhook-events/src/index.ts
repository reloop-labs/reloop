import { API_KEY_WEBHOOK_EVENTS } from "./api-key";
import { CONTACT_WEBHOOK_EVENTS } from "./contact";
import { DOMAIN_WEBHOOK_EVENTS } from "./domain";
import type { WebhookEventDefinition } from "./types";

export type { WebhookEventDefinition } from "./types";
export * from "./api-key";
export * from "./contact";
export * from "./domain";

export const AUDIENCE_CREATE_WEBHOOK_EVENT = {
	id: "audience.create",
	name: "audience.create",
	category: "audience",
	description: "Triggered when a new audience is created",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const AUDIENCE_UPDATE_WEBHOOK_EVENT = {
	id: "audience.update",
	name: "audience.update",
	category: "audience",
	description: "Triggered when an audience is updated",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const AUDIENCE_DELETE_WEBHOOK_EVENT = {
	id: "audience.delete",
	name: "audience.delete",
	category: "audience",
	description: "Triggered when an audience is deleted",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const AUDIENCE_WEBHOOK_EVENTS = [
	AUDIENCE_CREATE_WEBHOOK_EVENT,
	AUDIENCE_UPDATE_WEBHOOK_EVENT,
	AUDIENCE_DELETE_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];

export const EMAIL_SENT_WEBHOOK_EVENT = {
	id: "email.sent",
	name: "email.sent",
	category: "email",
	description: "Triggered when an email is successfully sent",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_OPENED_WEBHOOK_EVENT = {
	id: "email.opened",
	name: "email.opened",
	category: "email",
	description: "Triggered when an email is opened by the recipient",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_CLICKED_WEBHOOK_EVENT = {
	id: "email.clicked",
	name: "email.clicked",
	category: "email",
	description: "Triggered when a link in an email is clicked",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_FAILED_WEBHOOK_EVENT = {
	id: "email.failed",
	name: "email.failed",
	category: "email",
	description: "Triggered when an email fails to send",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_BOUNCED_WEBHOOK_EVENT = {
	id: "email.bounced",
	name: "email.bounced",
	category: "email",
	description: "Triggered when an email bounces",
	isActive: true,
} as const satisfies WebhookEventDefinition;

export const EMAIL_WEBHOOK_EVENTS = [
	EMAIL_SENT_WEBHOOK_EVENT,
	EMAIL_OPENED_WEBHOOK_EVENT,
	EMAIL_CLICKED_WEBHOOK_EVENT,
	EMAIL_FAILED_WEBHOOK_EVENT,
	EMAIL_BOUNCED_WEBHOOK_EVENT,
] as const satisfies readonly WebhookEventDefinition[];

export const WEBHOOK_EVENTS = [
	...DOMAIN_WEBHOOK_EVENTS,
	...AUDIENCE_WEBHOOK_EVENTS,
	...EMAIL_WEBHOOK_EVENTS,
	...API_KEY_WEBHOOK_EVENTS,
	...CONTACT_WEBHOOK_EVENTS,
] as const;

export const WEBHOOK_EVENTS_BY_ID: ReadonlyMap<
	string,
	(typeof WEBHOOK_EVENTS)[number]
> = new Map(
	WEBHOOK_EVENTS.map((event) => [event.id, event]),
);

export type WebhookEventCategory =
	(typeof WEBHOOK_EVENTS)[number]["category"];

export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number]["id"];
