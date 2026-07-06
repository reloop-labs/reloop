import { API_KEY_WEBHOOK_EVENTS } from "./api-key.js";
import { CONTACT_WEBHOOK_EVENTS } from "./contact.js";
import { DOMAIN_WEBHOOK_EVENTS } from "./domain.js";
import { EMAIL_WEBHOOK_EVENTS } from "./email.js";

export * from "./api-key.js";
export * from "./contact.js";
export * from "./domain.js";
export * from "./email.js";
export type { WebhookEventDefinition } from "./types.js";

export const WEBHOOK_EVENTS = [
	...DOMAIN_WEBHOOK_EVENTS,
	...API_KEY_WEBHOOK_EVENTS,
	...CONTACT_WEBHOOK_EVENTS,
	...EMAIL_WEBHOOK_EVENTS,
] as const;

export const WEBHOOK_EVENTS_BY_ID: ReadonlyMap<
	string,
	(typeof WEBHOOK_EVENTS)[number]
> = new Map(WEBHOOK_EVENTS.map((event) => [event.id, event]));

export type WebhookEventCategory = (typeof WEBHOOK_EVENTS)[number]["category"];

export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number]["id"];
