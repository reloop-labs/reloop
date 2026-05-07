if (!process.env.REDIS_URL) {
	process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
}

if (!process.env.BASE_URL) {
	process.env.BASE_URL = "https://local.reloop.sh";
}

export const logsConfig = {
	port: Number(process.env.PORT) || 8016,
	NODE_ENV: process.env.NODE_ENV || "development",
	REDIS_URL: process.env.REDIS_URL,
	BASE_URL: process.env.BASE_URL,
	LOGS_API_KEY: process.env.LOGS_API_KEY || "reloop-log-api-key",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	clickhouse: {
		url:
			process.env.CLICKHOUSE_URL ||
			process.env.CLICKHOUSE_HOST ||
			"http://localhost:8123",
		username: process.env.CLICKHOUSE_USER || "default",
		password: process.env.CLICKHOUSE_PASSWORD || "reloop123",
		database:
			process.env.CLICKHOUSE_DATABASE || process.env.CLICKHOUSE_DB || "reloop",
	},
} as const;
