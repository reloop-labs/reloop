import { bus } from "@reloop/bus";
import { workflowConfig } from "@be/workflow/workflow.config";
import { startWorkflowWorker } from "@be/workflow/queues/workflow.worker";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache("workflow", 86400, workflowConfig.REDIS_URL);

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("redis", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("postgres", "Postgres connected");
		await bus.connect(workflowConfig.NATS_URL);
		log.info("nats", "NATS connected");
		startWorkflowWorker();
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
