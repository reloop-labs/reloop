export const toolsConfig = {
	port: Number(process.env.PORT || "8026"),
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	TESTER_EMAIL: process.env.TESTER_EMAIL || "",
	TESTER_DOMAIN: process.env.TESTER_DOMAIN || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	TOOLS_GEMINI_API_KEY: process.env.TOOLS_GEMINI_API_KEY || "",

	constants: {
		maxInputLength: 400,
		rateLimitMax: 60,
		rateLimitWindowSeconds: 60,
		testSessionTtlSeconds: 86400, // 24 hours
		maxSessionPerIpPerHour: 30,
		maxBatchAddresses: 1000,
		maxBatchCsvBytes: 512 * 1024, // 512 KB
		batchJobTtlSeconds: 3600, // 1 hour
		maxBatchJobsPerIpPerHour: 5,
	},
};
