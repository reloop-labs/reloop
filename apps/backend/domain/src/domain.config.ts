export const domainConfig = {
	port: process.env.PORT || 8011,
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://reloop.local",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	HOST_DOMAIN: process.env.HOST_DOMAIN || "reloop.sh",
	DKIM_SELECTOR: process.env.DKIM_SELECTOR || "reloop",

	constants: {
		keyLength: 2048,
		mxPriority: 10,
	},
};
