function envFlag(value: string | undefined): boolean {
	return value === "true" || value === "1";
}

export const creditsConfig = {
	PORT: Number(process.env.PORT || "8023"),
	NODE_ENV: process.env.NODE_ENV || "development",
	INITIAL_CREDITS: Number(process.env.INITIAL_CREDITS || "100"),
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	BILLING_ENABLED: envFlag(process.env.BILLING_ENABLED),
	POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN || "",
	POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET || "",
	POLAR_SERVER:
		process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
	BILLING_SUCCESS_URL:
		process.env.BILLING_SUCCESS_URL ||
		"https://local.reloop.sh/dashboard/settings/billing?checkout=success",
	BILLING_RETURN_URL:
		process.env.BILLING_RETURN_URL ||
		"https://local.reloop.sh/dashboard/settings/billing",
} as const;
