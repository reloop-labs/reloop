import {
	DOMAIN_VERIFY_ATTEMPTS,
	DOMAIN_VERIFY_BACKOFF_TYPE,
	DOMAIN_VERIFY_INITIAL_DELAY_MS,
} from "@be/workflow/queues/domain-verify-schedule";
import { workflowQueue } from "@be/workflow/queues/workflow.queue";
import { startWorkflowWorker } from "@be/workflow/queues/workflow.worker";
import { initWebhookSubscribers } from "@be/workflow/subscribers/webhook.subscriber";
import { workflowConfig } from "@be/workflow/workflow.config";
import { BusEvent, bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const redis = new RedisCache(
	"workflow",
	86400,
	workflowConfig.REDIS_URL,
);

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("redis", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("postgres", "Postgres connected");
		await bus.connect(workflowConfig.NATS_URL);
		log.info("nats", "NATS connected");

		// Subscribe to domain verification requests
		await bus.subscribe(
			BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED,
			async (payload) => {
				log.info({
					message: "Received domain verification request via NATS",
					domainId: payload.domainId,
				});
				const jobId = `verify-domain-${payload.domainId}`;
				const existing = await workflowQueue.getJob(jobId);
				if (existing) {
					const state = await existing.getState();
					if (state === "completed" || state === "failed") {
						await existing.remove();
					} else {
						log.info({
							message: "Domain verification job already in progress",
							domainId: payload.domainId,
							state,
						});
						return;
					}
				}
				await workflowQueue.add(
					"verify-domain",
					{
						workflowId: payload.domainId,
						organizationId: payload.organizationId,
						type: "verify-domain",
						payload: { domain: payload.domain },
					},
					{
						jobId,
						delay: DOMAIN_VERIFY_INITIAL_DELAY_MS,
						attempts: DOMAIN_VERIFY_ATTEMPTS,
						backoff: { type: DOMAIN_VERIFY_BACKOFF_TYPE },
					},
				);
			},
		);

		// Initialize other NATS subscribers
		await initWebhookSubscribers();

		startWorkflowWorker();
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
