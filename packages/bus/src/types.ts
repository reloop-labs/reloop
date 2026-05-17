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
export interface DomainCreatedPayload {
	domainId: string;
	domain: string;
	organizationId: string;
}
export interface DomainUpdatedPayload {
	domainId: string;
	domain: string;
	organizationId: string;
}
export interface DomainDeletedPayload {
	domainId: string;
	domain: string;
	organizationId: string;
}
export interface DomainUndeletedPayload {
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
export interface OrganizationJoinedPayload {
	organizationId: string;
	orgName: string;
	userId: string;
	userEmail: string;
	memberName: string;
	role: string;
	inviterName: string;
}

export interface ApiKeyCreatedPayload {
	api_key_id: string;
	organizationId: string;
}

export interface ApiKeyDeletedPayload {
	api_key_id: string;
	organizationId: string;
}

export interface ApiKeyDisabledPayload {
	api_key_id: string;
	organizationId: string;
}

export interface ApiKeyEnabledPayload {
	api_key_id: string;
	organizationId: string;
}

export interface ApiKeyRotatedPayload {
	api_key_id: string;
	organizationId: string;
}

export interface ApiKeyUpdatedPayload {
	api_key_id: string;
	organizationId: string;
}

export interface InviteCreatedPayload {
	email: string;
	organizationName: string;
	inviteLink: string;
	inviterName: string;
	inviterEmail: string;
	isResend?: boolean;
}

export interface OtpRequestedPayload {
	email: string;
	otp: string;
	type:
	| "sign-in"
	| "email-verification"
	| "forget-password"
	| "change-email"
	| "two-factor";
}

export interface PaymentFailedPayload {
	email: string;
	amount: string;
	planName: string;
}

export interface QuotaWarningPayload {
	email: string;
	percentage: number;
	resourceType: string;
}

export interface SigninDetectedPayload {
	email: string;
	fullName: string;
	browser: string;
	os: string;
	ip: string;
	location: string;
}

export interface TrialEndingPayload {
	email: string;
	daysLeft: number;
}

export interface DnsConfigRequestedPayload {
	email: string;
	domain: string;
	records: Array<{
		type: string;
		name: string;
		value: string;
		priority?: number;
	}>;
}

export interface DomainDnsReverificationRequestedPayload {
	domainId: string;
	organizationId: string;
	domain: string;
	/** ISO timestamp of when the check that triggered this event ran */
	triggeredAt: string;
}

export interface UsageUpdatedPayload {
	organizationId: string;
	creditsUsed: number;
	creditsRemaining: number;
	monthlyCredits: number;
	periodStart: string; // ISO
	periodEnd: string; // ISO
	emailsSentToday: number;
}

export interface QuotaExceededPayload {
	organizationId: string;
	creditsUsed: number;
	monthlyCredits: number;
}

export interface EventPayloads {
	[BusEvent.USER_CREATED]: UserCreatedPayload;
	[BusEvent.USER_UPDATED]: UserUpdatedPayload;
	[BusEvent.USER_DELETED]: UserDeletedPayload;
	[BusEvent.DOMAIN_VERIFIED]: DomainVerifiedPayload;
	[BusEvent.DOMAIN_CREATED]: DomainCreatedPayload;
	[BusEvent.DOMAIN_UPDATED]: DomainUpdatedPayload;
	[BusEvent.DOMAIN_DELETED]: DomainDeletedPayload;
	[BusEvent.DOMAIN_UNDELETED]: DomainUndeletedPayload;
	[BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED]: DomainDnsReverificationRequestedPayload;
	[BusEvent.WEBHOOK_TRIGGERED]: WebhookTriggeredPayload;
	[BusEvent.EMAIL_SENT]: EmailSentPayload;
	[BusEvent.ORGANIZATION_CREATED]: OrganizationCreatedPayload;
	[BusEvent.ORGANIZATION_JOINED]: OrganizationJoinedPayload;
	[BusEvent.LOG_CREATED]: LogCreatedPayload;
	[BusEvent.API_KEY_CREATED]: ApiKeyCreatedPayload;
	[BusEvent.API_KEY_DELETED]: ApiKeyDeletedPayload;
	[BusEvent.API_KEY_DISABLED]: ApiKeyDisabledPayload;
	[BusEvent.API_KEY_ENABLED]: ApiKeyEnabledPayload;
	[BusEvent.API_KEY_ROTATED]: ApiKeyRotatedPayload;
	[BusEvent.API_KEY_UPDATED]: ApiKeyUpdatedPayload;
	[BusEvent.INVITE_CREATED]: InviteCreatedPayload;
	[BusEvent.OTP_REQUESTED]: OtpRequestedPayload;
	[BusEvent.PAYMENT_FAILED]: PaymentFailedPayload;
	[BusEvent.QUOTA_WARNING]: QuotaWarningPayload;
	[BusEvent.SIGNIN_DETECTED]: SigninDetectedPayload;
	[BusEvent.TRIAL_ENDING]: TrialEndingPayload;
	[BusEvent.DNS_CONFIG_REQUESTED]: DnsConfigRequestedPayload;
	[BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED]: DomainDnsReverificationRequestedPayload;
	[BusEvent.USAGE_UPDATED]: UsageUpdatedPayload;
	[BusEvent.QUOTA_EXCEEDED]: QuotaExceededPayload;
}
