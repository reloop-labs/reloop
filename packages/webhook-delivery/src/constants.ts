/** BullMQ queue name for outbound webhook HTTP delivery. */
export const WEBHOOK_DELIVERY_QUEUE = "webhook-delivery-queue";

/** BullMQ job name. */
export const WEBHOOK_DELIVERY_JOB = "deliver-webhook";

/** NATS queue group so only one workflow replica fans out each event. */
export const WEBHOOK_DISPATCHER_QUEUE_GROUP = "webhook-dispatcher";

/** Custom BullMQ backoff type for the documented retry schedule. */
export const WEBHOOK_RETRY_BACKOFF_TYPE = "webhook-retry";

/** Default max delivery attempts (including the first). */
export const WEBHOOK_MAX_ATTEMPTS = 7;

/** Consecutive *terminal* delivery failures before auto-disabling endpoint. */
export const WEBHOOK_DISABLE_AFTER_CONSECUTIVE_FAILURES = 10;

/** Outbound HTTP timeout for customer endpoints. */
export const WEBHOOK_HTTP_TIMEOUT_MS = 10_000;

/** Truncate stored response bodies. */
export const WEBHOOK_RESPONSE_BODY_MAX_CHARS = 8_192;

export const WEBHOOK_USER_AGENT = "Reloop-Webhooks/1.0";

export const HEADER_SIGNATURE = "Reloop-Signature";
export const HEADER_TIMESTAMP = "Reloop-Timestamp";
export const HEADER_ID = "Reloop-Id";

/** Headers customers may not override via customHeaders. */
export const RESERVED_HEADER_NAMES = new Set(
	[
		"content-type",
		"content-length",
		"host",
		"user-agent",
		HEADER_SIGNATURE,
		HEADER_TIMESTAMP,
		HEADER_ID,
		// legacy / common overrides
		"x-webhook-signature",
		"x-webhook-timestamp",
		"reloop-signature",
		"authorization",
	].map((h) => h.toLowerCase()),
);
