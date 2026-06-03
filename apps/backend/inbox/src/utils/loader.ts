import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";
import { mailConfig } from "../mail.config";

export const redis = new RedisCache("mail");

export async function loader() {
	try {
		await redis.healthCheck();
		log.info("redis", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("postgres", "Postgres connected");

		await bus.connect(mailConfig.NATS_URL);
		log.info("nats", "NATS connected");

		log.info("subscribers", "Subscribers initialized");

		log.info("loader", "Mail service loader initialized");
	} catch (e) {
		log.error({
			message: "Error during mail service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
}
