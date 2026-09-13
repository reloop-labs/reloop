export const contactsConfig = {
	port: Number(process.env.PORT || "8014"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	PREFERENCES_SECRET:
		process.env.PREFERENCES_SECRET ||
		"reloop-preferences-secret-key-change-in-prod",
	EXPORT_DOWNLOAD_SECRET:
		process.env.EXPORT_DOWNLOAD_SECRET ||
		process.env.PREFERENCES_SECRET ||
		"reloop-preferences-secret-key-change-in-prod",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	S3: {
		ENDPOINT: process.env.S3_ENDPOINT || "http://localhost:9010",
		ACCESS_KEY: process.env.S3_ACCESS_KEY || "reloop",
		SECRET_KEY: process.env.S3_SECRET_KEY || "reloop123",
		BUCKET: process.env.S3_BUCKET || "reloop-uploads",
		REGION: process.env.S3_REGION || "us-east-1",
		FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE || "true",
	},
};
