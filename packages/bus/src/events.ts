export enum BusEvent {
	// User Events
	USER_CREATED = "user.created",
	USER_UPDATED = "user.updated",
	USER_DELETED = "user.deleted",

	// Domain Events
	DOMAIN_VERIFIED = "domain.verified",
	DOMAIN_CREATED = "domain.created",
	DOMAIN_UPDATED = "domain.updated",
	DOMAIN_DELETED = "domain.deleted",
	DOMAIN_UNDELETED = "domain.undelete",
	DOMAIN_DNS_REVERIFICATION_REQUESTED = "domain.dns_reverification.requested",

	// Webhook Events
	WEBHOOK_TRIGGERED = "webhook.triggered",

	// Email Events
	EMAIL_SENT = "email.sent",
	SEND_TEST_EMAIL = "email.send_test",
	INVITE_CREATED = "invite.created",
	OTP_REQUESTED = "otp.requested",
	PAYMENT_FAILED = "payment.failed",
	QUOTA_WARNING = "quota.warning",
	SIGNIN_DETECTED = "signin.detected",
	TRIAL_ENDING = "trial.ending",
	DNS_CONFIG_REQUESTED = "dns_config.requested",

	// Organization Events
	ORGANIZATION_CREATED = "organization.created",
	ORGANIZATION_JOINED = "organization.joined",

	// Log Events
	LOG_CREATED = "log.created",

	// Billing / Usage Events
	USAGE_UPDATED = "usage.updated",
	QUOTA_EXCEEDED = "quota.exceeded",

	// API Key Events
	API_KEY_CREATED = "api_key.created",
	API_KEY_DELETED = "api_key.deleted",
	API_KEY_DISABLED = "api_key.disabled",
	API_KEY_ENABLED = "api_key.enabled",
	API_KEY_ROTATED = "api_key.rotated",
	API_KEY_UPDATED = "api_key.updated",

	// KumoMTA Events
	KUMOMTA_EVENT = "kumomta.event",

	// Contact Auto-Capture Events
	CONTACT_AUTO_CREATED = "contact.auto_created",
	CONTACT_DELIVERABILITY_UPDATED = "contact.deliverability_updated",

	// Inbox Events
	INBOUND_EMAIL_RECEIVED = "inbox.inbound_received",
	MAILBOX_CREATED = "mailbox.created",
	MAILBOX_DELETED = "mailbox.deleted",
}
