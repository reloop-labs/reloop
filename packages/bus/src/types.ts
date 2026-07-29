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
	event: string;
	payload: Record<string, any>;
	organizationId?: string;
	userId?: string;
}

export interface EmailSentPayload {
	organizationId: string;
	emailLogId: string;
	recipientCount: number;
	timestamp: string;
}

export interface EmailScheduledPayload {
	organizationId: string;
	emailLogId: string;
	recipientCount: number;
	/** ISO timestamp when the message should be sent. */
	scheduledAt: string;
	timestamp: string;
}

export interface EmailOpenedPayload {
	organizationId: string;
	emailLogId: string;
	/** email_event row id for idempotent webhook fan-out */
	emailEventId: string;
	timestamp: string;
}

export interface EmailClickedPayload {
	organizationId: string;
	emailLogId: string;
	emailEventId: string;
	url: string;
	timestamp: string;
}

export interface EmailFailedPayload {
	organizationId: string;
	emailLogId: string;
	errorMessage: string;
	timestamp: string;
}

export interface ContactLifecyclePayload {
	organizationId: string;
	contactId: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	status: string;
}

export interface ContactGroupLifecyclePayload {
	organizationId: string;
	groupId: string;
	name: string;
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
		requestBody?: Record<string, unknown> | null;
	};

	// Who performed the action
	actor_type?: "user" | "api_key" | "system";
	actor_id?: string; // user_id or api_key_id

	// Tenant context — sent by the publisher
	organization_id?: string;
	user_id?: string;

	// What was acted on
	resource_type?: string; // 'api_key' | 'domain' | 'email' | 'organization' | etc.
	resource_id?: string;

	// Context
	service?: string; // source microservice: 'api_key' | 'domain' | 'mail' | 'auth' | 'billing'
	action?: string; // verb: 'created' | 'updated' | 'deleted' | 'sent' | 'verified' | etc.
	ip_address?: string;
	user_agent?: string;
	environment?: "production" | "development" | "test";
	// NOTE: never add `cookie` here — session tokens must not be persisted in audit logs
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
		ttl?: string;
		/** Logical record kind: SPF | DKIM | DMARC | MX | CNAME */
		recordTypeName?: string;
		/** Why the record exists: sending | receiving | tracking */
		purpose?: "sending" | "receiving" | "tracking";
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

export interface KumomtaLogRecordPayload {
	type:
		| "Reception"
		| "Delivery"
		| "Bounce"
		| "TransientFailure"
		| "Expiration"
		| "OOB"
		| "Feedback"
		| "AdminBounce";
	id: string;
	sender: string;
	recipient: string;
	queue: string;
	site: string;
	size: number;
	bounce_classification?: string;
	response: {
		code: number;
		enhanced_code?: {
			class: number;
			subject: number;
			detail: number;
		} | null;
		content: string;
		command?: string | null;
	};
	headers: {
		Subject?: string;
		"X-Org-ID"?: string;
		"X-Domain-ID"?: string;
		"X-Email-Log-ID"?: string;
	};
	meta?: {
		"X-Email-Log-ID"?: string;
		[key: string]: unknown;
	};
	timestamp?: string | number;
}

export interface ContactAutoCreatedPayload {
	/** Internal contact ID (con_...) */
	contactId: string;
	/** Recipient email address */
	email: string;
	organizationId: string;
	/** emailLog ID that triggered creation */
	emailLogId: string;
	/** Whether this was a brand-new insert or a soft-delete restore */
	created: boolean;
}

export interface ContactDeliverabilityUpdatedPayload {
	contactId: string;
	email: string;
	organizationId: string;
	emailLogId: string;
	/** The deliverability verdict applied to the contact */
	deliverability: "delivered" | "bounced" | "spam";
	/** Whether the contact was also suppressed (blocked) as a result */
	suppressed: boolean;
}

export interface SendTestEmailPayload {
	to: string;
	from: string;
	subject: string;
	html: string;
}

export interface KumomtaInboundReceivedPayload {
	rawMessage: string;
}

export interface InboundEmailReceivedPayload {
	inboundEmailId: string;
	mailboxId: string;
	organizationId: string;
	messageId?: string;
	fromEmail: string;
	fromName?: string;
	toEmails: string[];
	ccEmails?: string[];
	subject: string;
	threadId?: string;
	hasAttachments?: boolean;
	isSpam?: boolean;
}

export interface MailboxCreatedPayload {
	mailboxId: string;
	organizationId: string;
	email: string;
}

export interface MailboxDeletedPayload {
	mailboxId: string;
	organizationId: string;
	email: string;
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
	[BusEvent.EMAIL_SCHEDULED]: EmailScheduledPayload;
	[BusEvent.EMAIL_OPENED]: EmailOpenedPayload;
	[BusEvent.EMAIL_CLICKED]: EmailClickedPayload;
	[BusEvent.EMAIL_FAILED]: EmailFailedPayload;
	[BusEvent.SEND_TEST_EMAIL]: SendTestEmailPayload;
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
	[BusEvent.KUMOMTA_EVENT]: KumomtaLogRecordPayload;
	[BusEvent.KUMOMTA_INBOUND_RECEIVED]: KumomtaInboundReceivedPayload;
	[BusEvent.CONTACT_CREATED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_UPDATED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_DELETED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_SUBSCRIBED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_UNSUBSCRIBED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_BLOCKED]: ContactLifecyclePayload;
	[BusEvent.CONTACT_GROUP_CREATED]: ContactGroupLifecyclePayload;
	[BusEvent.CONTACT_GROUP_UPDATED]: ContactGroupLifecyclePayload;
	[BusEvent.CONTACT_GROUP_DELETED]: ContactGroupLifecyclePayload;
	[BusEvent.CONTACT_AUTO_CREATED]: ContactAutoCreatedPayload;
	[BusEvent.CONTACT_DELIVERABILITY_UPDATED]: ContactDeliverabilityUpdatedPayload;
	[BusEvent.INBOUND_EMAIL_RECEIVED]: InboundEmailReceivedPayload;
	[BusEvent.MAILBOX_CREATED]: MailboxCreatedPayload;
	[BusEvent.MAILBOX_DELETED]: MailboxDeletedPayload;
}
