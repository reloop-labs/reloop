export const campaignsConfig = {
	port: Number(process.env.PORT || "8027"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	/**
	 * Public origin for unsubscribe URLs when the sender domain has no custom
	 * tracking domain. Mirrors the mail service default: the links app host
	 * (e.g. https://link.reloop.sh), which proxies one-click unsubscribes.
	 */
	TRACKING_BASE_URL: (
		process.env.TRACKING_BASE_URL ||
		process.env.TRACKING_DOMAIN ||
		(process.env.NODE_ENV === "production"
			? `https://link.${(process.env.HOST_DOMAIN || "reloop.sh").replace(/^https?:\/\//, "")}`
			: process.env.BASE_URL || "https://local.reloop.sh")
	).replace(/\/+$/, ""),
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	RELOOP_INTERNAL_SECRET:
		process.env.RELOOP_INTERNAL_SECRET || "reloop_internal_secret_default_123",
	/**
	 * Shared with the contacts service — signs per-recipient preferences tokens
	 * for unsubscribe URLs. Must match contacts PREFERENCES_SECRET.
	 */
	PREFERENCES_SECRET:
		process.env.PREFERENCES_SECRET ||
		"reloop-preferences-secret-key-change-in-prod",
	constants: {
		defaultPageSize: 10,
		maxPageSize: 100,
	},
};
