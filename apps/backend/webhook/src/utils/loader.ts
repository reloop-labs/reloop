import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";
import { startWebhookDeliveryWorker } from "@reloop/webhook/queues/webhook-delivery.worker";

export const redis = new RedisCache("webhook");

export const loader = async () => {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");
		await db.execute("SELECT 1 as test");
		logger.info("Postgres connected");
		startWebhookDeliveryWorker();
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during service initialization",
		);
	}
};
