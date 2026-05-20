import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";
import { webhookConfig } from "../webhook.config";

export const redis = new RedisCache("webhook");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("Redis", "Connected");
		await db.execute("SELECT 1 as test");
		log.info("Postgres", "Connected");
		await bus.connect(webhookConfig.NATS_URL);
		log.info("NATS", "Connected");
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
