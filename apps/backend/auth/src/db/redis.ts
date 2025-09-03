import { createClient } from "redis";

export const redis = createClient({
	url:
		process.env.REDIS_URL ||
		`redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
});
