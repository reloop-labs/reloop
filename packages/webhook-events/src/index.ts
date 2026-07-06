import { API_KEY_WEBHOOK_EVENTS } from "./api-key";
import { CONTACT_WEBHOOK_EVENTS } from "./contact";
import { DOMAIN_WEBHOOK_EVENTS } from "./domain";
import { EMAIL_WEBHOOK_EVENTS } from "./email";

export * from "./api-key";
export * from "./contact";
export * from "./domain";
export * from "./email";
export type { WebhookEventDefinition } from "./types";

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
