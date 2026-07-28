export const emailConfig = {
	PORT: Number(process.env.PORT || "8022"),
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	RELOOP_API_KEY: process.env.RELOOP_API_KEY || "",
	RELOOP_SENDER_DOMAIN: process.env.RELOOP_SENDER_DOMAIN || "",
	/** Public site origin for links in emails. Set `BASE_URL=https://reloop.sh` in prod. */
	BASE_URL: (process.env.BASE_URL || "https://local.reloop.sh").replace(
		/\/$/,
		"",
	),
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	/** Platform domain for onboarding API-key test sends (must match mail service). */
	PLATFORM_TEST_ENABLED: process.env.PLATFORM_TEST_ENABLED !== "false",
	PLATFORM_TEST_FROM_DOMAIN:
		process.env.PLATFORM_TEST_FROM_DOMAIN ||
		process.env.RELOOP_SENDER_DOMAIN ||
		"reloop.dev",
	PLATFORM_TEST_FROM_LOCAL_PART:
		process.env.PLATFORM_TEST_FROM_LOCAL_PART || "onboarding",
};
