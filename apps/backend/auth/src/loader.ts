import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";

const redis = new RedisCache("auth");
export const loader = async () => {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");
		await db.execute("SELECT 1 as test");
		logger.info("Postgres connected");
	} catch (e) {
		logger.error(e);
	}
};
