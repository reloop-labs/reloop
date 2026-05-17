import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache("api-key", 86400);

export const loader = async () => {
	try {
		await Promise.all([
			redis.healthCheck().then(() => log.info("Redis", "Connected")),
			db.execute("SELECT 1 as test").then(() => log.info("Postgres", "Connected")),
			bus.connect(apiKeyConfig.NATS_URL).then(() => log.info("NATS", "Connected")),
		]);
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "Error during service initialization",
		});
	}
};
