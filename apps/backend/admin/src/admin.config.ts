export const adminConfig = {
	port: Number(process.env.PORT || "8024"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	NODE_ENV: process.env.NODE_ENV || "development",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
};
