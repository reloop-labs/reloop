export const mailConfig = {
	port: Number(process.env.PORT || "8015"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	KUMOMTA_HTTP_URL: process.env.KUMOMTA_HTTP_URL || "http://localhost:8020",
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	TRACKING_SECRET:
		process.env.TRACKING_SECRET || "reloop_tracking_secret_default_123",
	RELOOP_INTERNAL_SECRET:
		process.env.RELOOP_INTERNAL_SECRET || "reloop_internal_secret_default_123",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	/**
	 * Platform-owned domain used for onboarding “send test to me” emails.
	 * Not for free-form API sends — only the dedicated platform-test path.
	 */
	PLATFORM_TEST_ENABLED: process.env.PLATFORM_TEST_ENABLED !== "false",
	PLATFORM_TEST_FROM_DOMAIN:
		process.env.PLATFORM_TEST_FROM_DOMAIN ||
		process.env.RELOOP_SENDER_DOMAIN ||
		"reloop.dev",
	PLATFORM_TEST_FROM_LOCAL_PART:
		process.env.PLATFORM_TEST_FROM_LOCAL_PART || "onboarding",
	/** Max platform-test sends per user per rolling window. */
	PLATFORM_TEST_RATE_LIMIT_MAX: Number(
		process.env.PLATFORM_TEST_RATE_LIMIT_MAX || "5",
	),
	PLATFORM_TEST_RATE_LIMIT_WINDOW_SECONDS: Number(
		process.env.PLATFORM_TEST_RATE_LIMIT_WINDOW_SECONDS || "3600",
	),

	// ── Rate Limiting ──────────────────────────────────────────────
	// Per-IP: stops brute-force from a single source
	RATE_LIMIT_IP_MAX: Number(process.env.RATE_LIMIT_IP_MAX || "20"),
	RATE_LIMIT_IP_WINDOW_SECONDS: Number(
		process.env.RATE_LIMIT_IP_WINDOW_SECONDS || "60",
	),

	// Per-Organization: prevents runaway integrations per tenant
	RATE_LIMIT_ORG_MAX: Number(process.env.RATE_LIMIT_ORG_MAX || "100"),
	RATE_LIMIT_ORG_WINDOW_SECONDS: Number(
		process.env.RATE_LIMIT_ORG_WINDOW_SECONDS || "60",
	),

	// Per-Organization daily: hard daily cap per tenant
	RATE_LIMIT_ORG_DAILY_MAX: Number(
		process.env.RATE_LIMIT_ORG_DAILY_MAX || "5000",
	),

	// Per-User: stops abuse from a single user within an org
	RATE_LIMIT_USER_MAX: Number(process.env.RATE_LIMIT_USER_MAX || "50"),
	RATE_LIMIT_USER_WINDOW_SECONDS: Number(
		process.env.RATE_LIMIT_USER_WINDOW_SECONDS || "60",
	),

	// Global: protects infrastructure from DDoS
	RATE_LIMIT_GLOBAL_MAX: Number(process.env.RATE_LIMIT_GLOBAL_MAX || "500"),
	RATE_LIMIT_GLOBAL_WINDOW_SECONDS: Number(
		process.env.RATE_LIMIT_GLOBAL_WINDOW_SECONDS || "60",
	),
};
