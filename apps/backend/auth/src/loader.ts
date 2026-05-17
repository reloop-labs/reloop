import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

import { authConfig } from "./auth.config";

const redis = new RedisCache("auth");
export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("server", "Postgres connected");
		await bus.connect(authConfig.NATS_URL);
		log.info("server", "NATS connected");
	} catch (e) {
		log.error({ message: String(e) });
	}
};
