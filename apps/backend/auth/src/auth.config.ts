export const authConfig = {
	port: Number(process.env.PORT || "8000"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	BETTER_AUTH_SECRET:
		process.env.BETTER_AUTH_SECRET || "tENkVU4GrhckuRw4Bcfh93EWgXOFcszn",
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	DEFAULT_OTP: process.env.DEFAULT_OTP,
	DISABLE_SIGNUP: process.env.DISABLE_SIGNUP,
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	LAGO_API_URL: process.env.LAGO_API_URL || "http://localhost:3100",
	LAGO_API_KEY: process.env.LAGO_API_KEY || "",
};
