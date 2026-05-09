import { bus } from "@reloop/bus";
import { domainConfig } from "@be/domain/domain.config";
import { startDomainVerificationWorker } from "@be/domain/queues/domain-verification.worker";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache("domain", 86400, domainConfig.REDIS_URL);

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("redis", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("postgres", "Postgres connected");
		await bus.connect(domainConfig.NATS_URL);
		log.info("nats", "NATS connected");
		startDomainVerificationWorker();
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
