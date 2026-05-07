import { BusEvent } from "./events";

export interface UserCreatedPayload {
	id: string;
	email: string;
	name?: string;
}

export interface UserUpdatedPayload {
	id: string;
	email?: string;
	name?: string;
}

export interface UserDeletedPayload {
	id: string;
}

export interface DomainVerifiedPayload {
	domainId: string;
	domain: string;
	organizationId: string;
}

export interface WebhookTriggeredPayload {
	webhookId: string;
	eventType: string;
	payload: Record<string, any>;
}

export interface EmailSentPayload {
	organizationId: string;
	emailLogId: string;
	recipientCount: number;
	timestamp: string;
}

export interface OrganizationCreatedPayload {
	id: string;
	name: string;
	slug: string;
}

export interface LogCreatedPayload {
	event: string;
	level: "debug" | "info" | "warn" | "error" | "fatal";
	trace_id?: string;
	metadata?: Record<string, unknown>;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
	cookie?: string;
}

export interface EventPayloads {
	[BusEvent.USER_CREATED]: UserCreatedPayload;
	[BusEvent.USER_UPDATED]: UserUpdatedPayload;
	[BusEvent.USER_DELETED]: UserDeletedPayload;
	[BusEvent.DOMAIN_VERIFIED]: DomainVerifiedPayload;
	[BusEvent.WEBHOOK_TRIGGERED]: WebhookTriggeredPayload;
	[BusEvent.EMAIL_SENT]: EmailSentPayload;
	[BusEvent.ORGANIZATION_CREATED]: OrganizationCreatedPayload;
	[BusEvent.LOG_CREATED]: LogCreatedPayload;
}

