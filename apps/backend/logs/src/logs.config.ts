export const logsConfig = {
	port: 8016,
	NODE_ENV: process.env.NODE_ENV || "development",
	clickhouse: {
		url:
			process.env.CLICKHOUSE_URL ||
			process.env.CLICKHOUSE_HOST ||
			"http://localhost:8123",
		username: process.env.CLICKHOUSE_USER || "default",
		password: process.env.CLICKHOUSE_PASSWORD || "reloop123",
		database:
			process.env.CLICKHOUSE_DATABASE ||
			process.env.CLICKHOUSE_DB ||
			"reloop",
	},
} as const;
