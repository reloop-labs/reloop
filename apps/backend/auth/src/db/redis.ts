import { createClient } from "redis";

export const redis = createClient({
	url: process.env.REDIS_URL,
});
