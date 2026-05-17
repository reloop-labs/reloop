import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache("api-key");
export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("Redis", "Connected");
		await db.execute("SELECT 1 as test");
		log.info("Postgres", "Connected");
		await bus.connect(apiKeyConfig.NATS_URL);
		log.info("NATS", "Connected");
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "Error during service initialization",
		});
	}
};
