import { log } from "evlog";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";

import { startWebhookDeliveryWorker } from "@reloop/webhook/queues/webhook-delivery.worker";
import { webhookConfig } from "../webhook.config";

export const redis = new RedisCache("webhook");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("server", "Postgres connected");
		await bus.connect(webhookConfig.NATS_URL);
		log.info("server", "NATS connected");
		startWebhookDeliveryWorker();
	} catch (e) {
		log.error({ error: e instanceof Error ? e.message : String(e) },
			"Error during service initialization",
		);
	}
};
