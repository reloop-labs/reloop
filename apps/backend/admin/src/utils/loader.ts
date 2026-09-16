import { adminConfig } from "@reloop/admin/admin.config";
import { initDomainCreatedSubscriber } from "@reloop/admin/subscribers/domain-created.subscriber";
import { initEmailFailedSubscriber } from "@reloop/admin/subscribers/email-failed.subscriber";
import { initSigninSubscriber } from "@reloop/admin/subscribers/signin.subscriber";
import { redis } from "@reloop/admin/utils/redis";
import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("Redis", "Connected");
		await db.execute("SELECT 1 as test");
		log.info("Postgres", "Connected");
		await bus.connect(adminConfig.NATS_URL);
		log.info("NATS", "Connected");
		await initEmailFailedSubscriber();
		await initSigninSubscriber();
		await initDomainCreatedSubscriber();
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
