import { domainConfig } from "@be/domain/domain.config";
import { startDomainVerificationWorker } from "@be/domain/queues/domain-verification.worker";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";

export const redis = new RedisCache("domain", 86400, domainConfig.REDIS_URL);

export const loader = async () => {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");
		await db.execute("SELECT 1 as test");
		logger.info("Postgres connected");
		startDomainVerificationWorker();
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during service initialization",
		);
	}
};
