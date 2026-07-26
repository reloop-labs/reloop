import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logsConfig } from "@reloop/logs/logs.config";
import { initSubscribers } from "@reloop/logs/subscribers";
import { sql } from "drizzle-orm";
import { log } from "evlog";

export const redis = new RedisCache("logs");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await db.execute(sql`SELECT 1`);
		log.info("server", "Postgres connection health check passed");
		await bus.connect(logsConfig.NATS_URL);
		log.info("server", "NATS connected");
		await bus.ensureStream("kumomta-events", ["kumomta.event"]);
		await initSubscribers();
	} catch (error) {
		log.error({
			...{
				error:
					error instanceof Error
						? {
								message: error.message,
								stack: error.stack,
								name: error.name,
							}
						: error,
			},
			message: "Error during initialization",
		});
	}
};
