// Set environment variables if not already set
if (!process.env.PG_URL)
	process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
	process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";

export const apiKeyConfig = {
	port: Number(process.env.PORT) || 8012,
	PG_URL: process.env.PG_URL,
	REDIS_URL: process.env.REDIS_URL,
	BASE_URL: process.env.BASE_URL,
	LOGS_API_KEY: process.env.LOGS_API_KEY || "reloop-log-api-key",
	NODE_ENV: process.env.NODE_ENV || "development",
};
