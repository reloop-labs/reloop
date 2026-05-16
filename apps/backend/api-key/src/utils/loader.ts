import { log } from "evlog";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";

import { apiKeyConfig } from "../api-key.config";

export const redis = new RedisCache("api-key");
export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("server", "Postgres connected");
		await bus.connect(apiKeyConfig.NATS_URL);
		log.info("server", "NATS connected");
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "Error during service initialization"
		});
	}
};
