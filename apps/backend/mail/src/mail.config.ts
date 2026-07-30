export const mailConfig = {
	port: Number(process.env.PORT || "8015"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	/**
	 * Public origin for click redirects + open pixels when the customer has no
	 * custom tracking domain. Must be the links app host (e.g. link.reloop.sh),
	 * not the marketing/API host — only the links app serves /redirect/*.
	 * Local: Caddy routes /redirect on BASE_URL to the links app.
	 */
	TRACKING_BASE_URL: (
		process.env.TRACKING_BASE_URL ||
		process.env.TRACKING_DOMAIN ||
		(process.env.NODE_ENV === "production"
			? `https://link.${(process.env.HOST_DOMAIN || "reloop.sh").replace(/^https?:\/\//, "")}`
			: process.env.BASE_URL || "https://local.reloop.sh")
	).replace(/\/+$/, ""),
	KUMOMTA_HTTP_URL: process.env.KUMOMTA_HTTP_URL || "http://localhost:8020",
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	TRACKING_SECRET:
		process.env.TRACKING_SECRET || "reloop_tracking_secret_default_123",
	RELOOP_INTERNAL_SECRET:
		process.env.RELOOP_INTERNAL_SECRET || "reloop_internal_secret_default_123",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

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
