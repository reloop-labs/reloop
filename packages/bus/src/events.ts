export enum BusEvent {
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  DOMAIN_VERIFIED = "domain.verified",
  WEBHOOK_TRIGGERED = "webhook.triggered",
}

export interface EventPayloads {
  [BusEvent.USER_CREATED]: {
    id: string;
    email: string;
    name?: string;
  };
  [BusEvent.USER_UPDATED]: {
    id: string;
    email?: string;
    name?: string;
  };
  [BusEvent.USER_DELETED]: {
    id: string;
  };
  [BusEvent.DOMAIN_VERIFIED]: {
    domainId: string;
    domain: string;
    organizationId: string;
  };
  [BusEvent.WEBHOOK_TRIGGERED]: {
    webhookId: string;
    eventType: string;
    payload: Record<string, any>;
  };
}
