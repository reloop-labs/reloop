export const emailConfig = {
	PORT: Number(process.env.PORT || "8022"),
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	RELOOP_API_KEY: process.env.RELOOP_API_KEY || "",
	RELOOP_SENDER_DOMAIN: process.env.RELOOP_SENDER_DOMAIN || "",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
};
