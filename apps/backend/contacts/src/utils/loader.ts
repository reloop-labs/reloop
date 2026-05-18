import { contactsConfig } from "@be/contacts/contacts.config";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache("audience");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("Redis", "connected");
		await db.execute("SELECT 1 as test");
		log.info("Postgres", "connected");
		await bus.connect(contactsConfig.NATS_URL);
		log.info("NATS", "connected");
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
