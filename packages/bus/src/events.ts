export enum BusEvent {
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  DOMAIN_VERIFIED = "domain.verified",
  WEBHOOK_TRIGGERED = "webhook.triggered",
  EMAIL_SENT = "email.sent",
  ORGANIZATION_CREATED = "organization.created",
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
  [BusEvent.EMAIL_SENT]: {
    organizationId: string;
    emailLogId: string;
    recipientCount: number;
    timestamp: string;
  };
  [BusEvent.ORGANIZATION_CREATED]: {
    id: string;
    name: string;
    slug: string;
  };
}
