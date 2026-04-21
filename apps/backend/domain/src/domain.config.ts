// Set environment variables if not already set
if (!process.env.PG_URL)
	process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
	process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";

if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED)
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
if (!process.env.HOST_DOMAIN) process.env.HOST_DOMAIN = "reloop.sh";
if (!process.env.DKIM_SELECTOR) process.env.DKIM_SELECTOR = "reloop";

export const domainConfig = {
	port: Number(process.env.PORT) || 8011,
	PG_URL: process.env.PG_URL,
	REDIS_URL: process.env.REDIS_URL,
	BASE_URL: process.env.BASE_URL,
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
	HOST_DOMAIN: process.env.HOST_DOMAIN,
	DKIM_SELECTOR: process.env.DKIM_SELECTOR,
	LOGS_API_KEY: process.env.LOGS_API_KEY || "reloop-log-api-key",

	constants: {
		keyLength: 2048,
		mxPriority: 10,
	},
};
