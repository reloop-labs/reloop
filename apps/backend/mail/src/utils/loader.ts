import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";
import { mailConfig } from "../mail.config";
import { initSubscribers } from "../subscribers/index";

export const redis = new RedisCache("mail");

export async function loader() {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");
		await db.execute("SELECT 1 as test");
		logger.info("Postgres connected");

		await bus.connect(mailConfig.NATS_URL);
		logger.info("NATS connected");

		await initSubscribers();
		logger.info("Subscribers initialized");

		logger.info("Mail service loader initialized");
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during mail service initialization",
		);
	}
}
