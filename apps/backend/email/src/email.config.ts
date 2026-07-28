export const emailConfig = {
	PORT: Number(process.env.PORT || "8022"),
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	/** Public site origin for links in emails. Set `BASE_URL=https://reloop.sh` in prod. */
	BASE_URL: (process.env.BASE_URL || "https://local.reloop.sh").replace(
		/\/$/,
		"",
	),
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	/**
	 * API key for the org that owns RELOOP_SENDER_DOMAIN (and typically
	 * ONBOARDING_TEST_DOMAIN). Used by reloop-email for all platform sends.
	 */
	RELOOP_API_KEY: process.env.RELOOP_API_KEY || "",

	/**
	 * System product mail From domain (auth OTP, billing, invites, …).
	 * Separate from onboarding test mail.
	 */
	RELOOP_SENDER_DOMAIN: process.env.RELOOP_SENDER_DOMAIN || "",

	/**
	 * Onboarding “Send email” From domain only (post–API-key button).
	 * Separate from RELOOP_SENDER_DOMAIN.
	 */
	ONBOARDING_TEST_DOMAIN: process.env.ONBOARDING_TEST_DOMAIN || "",
};
