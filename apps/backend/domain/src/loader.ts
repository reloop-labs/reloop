import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";

const redis = new RedisCache("auth");
export const loader = async () => {
	try {
		await redis.healthCheck();
		console.log("Redis connected");
		await db.execute("SELECT 1 as test");
		console.log("Postgres connected");
	} catch (e) {
		console.error(e);
	}
};
