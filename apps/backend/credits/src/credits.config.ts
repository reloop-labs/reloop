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
};
