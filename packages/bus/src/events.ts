export enum BusEvent {
	// User Events
	USER_CREATED = "user.created",
	USER_UPDATED = "user.updated",
	USER_DELETED = "user.deleted",

	// Domain Events
	DOMAIN_VERIFIED = "domain.verified",

	// Webhook Events
	WEBHOOK_TRIGGERED = "webhook.triggered",

	// Email Events
	EMAIL_SENT = "email.sent",
	API_KEY_CREATED = "api_key.created",
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
}
