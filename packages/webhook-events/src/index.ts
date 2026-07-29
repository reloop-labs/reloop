import { API_KEY_WEBHOOK_EVENTS } from "./api-key";
import { CONTACT_WEBHOOK_EVENTS } from "./contact";
import { DOMAIN_WEBHOOK_EVENTS } from "./domain";
import { EMAIL_WEBHOOK_EVENTS } from "./email";

export * from "./api-key";
export * from "./contact";
export * from "./domain";
export * from "./email";
export * from "./payloads";
export type {
	ApiKeyWebhookData,
	ContactGroupWebhookData,
	ContactWebhookData,
	DomainWebhookData,
	EmailWebhookData,
	InboundEmailWebhookData,
	WebhookEnvelope,
	WebhookEventDefinition,
} from "./types";

export const WEBHOOK_EVENTS = [
	...EMAIL_WEBHOOK_EVENTS,
	...DOMAIN_WEBHOOK_EVENTS,
	...API_KEY_WEBHOOK_EVENTS,
	...CONTACT_WEBHOOK_EVENTS,
] as const;

/** Events customers can subscribe to in create/update UI and API validation. */
export const ACTIVE_WEBHOOK_EVENTS = WEBHOOK_EVENTS.filter((e) => e.isActive);

export const WEBHOOK_EVENTS_BY_ID: ReadonlyMap<
	string,
	(typeof WEBHOOK_EVENTS)[number]
> = new Map(WEBHOOK_EVENTS.map((event) => [event.id, event]));

export type WebhookEventCategory = (typeof WEBHOOK_EVENTS)[number]["category"];

export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number]["id"];

export type ActiveWebhookEventName = (typeof ACTIVE_WEBHOOK_EVENTS)[number]["id"];

export function isActiveWebhookEvent(id: string): boolean {
	return WEBHOOK_EVENTS_BY_ID.get(id)?.isActive === true;
}
