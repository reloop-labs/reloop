// Database configuration
export const databaseConfig = {
	postgres: {
		host: process.env.DB_HOST || "localhost",
		port: Number.parseInt(process.env.DB_PORT || "5432", 10),
		database: process.env.DB_NAME || "reloop",
		username: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD || "password",
		ssl: process.env.DB_SSL === "true",
		pool: {
			min: Number.parseInt(process.env.DB_POOL_MIN || "2", 10),
			max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
		},
	},
	redis: {
		host: process.env.REDIS_HOST || "localhost",
		port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
		password: process.env.REDIS_PASSWORD || undefined,
		db: Number.parseInt(process.env.REDIS_DB || "0", 10),
		keyPrefix: process.env.REDIS_KEY_PREFIX || "reloop:",
	},
	migrations: {
		directory: process.env.MIGRATIONS_DIR || "./migrations",
		tableName: process.env.MIGRATIONS_TABLE || "migrations",
	},
} as const;

export type DatabaseConfig = typeof databaseConfig;
