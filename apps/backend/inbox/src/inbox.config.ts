export const inboxConfig = {
	port: Number(process.env.PORT || "8017"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	// S3 Configuration for attachments
	S3_ENDPOINT: process.env.S3_ENDPOINT || "http://localhost:9010", // MinIO default
	S3_REGION: process.env.S3_REGION || "us-east-1",
	S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || "reloop",
	S3_SECRET_KEY: process.env.S3_SECRET_KEY || "reloop123",
	S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "reloop-attachments",
};
