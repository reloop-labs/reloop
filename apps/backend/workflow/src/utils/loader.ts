import { startAutomationWorker } from "@be/workflow/queues/automation.worker";
import {
	DOMAIN_VERIFY_ATTEMPTS,
	DOMAIN_VERIFY_BACKOFF_TYPE,
	DOMAIN_VERIFY_INITIAL_DELAY_MS,
} from "@be/workflow/queues/domain-verify-schedule";
import { startWebhookDeliveryWorker } from "@be/workflow/queues/webhook-delivery.worker";
import { workflowQueue } from "@be/workflow/queues/workflow.queue";
import { startWorkflowWorker } from "@be/workflow/queues/workflow.worker";
import { initAutomationSubscribers } from "@be/workflow/subscribers/automation.subscriber";
import { initWebhookSubscribers } from "@be/workflow/subscribers/webhook.subscriber";
import { redis } from "@be/workflow/utils/redis";
import { workflowConfig } from "@be/workflow/workflow.config";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export { redis };

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
					// Active jobs are locked — let them finish (they re-read settings from DB).
					// Otherwise replace so config toggles / re-verify restart the staggered schedule.
					if (state === "active") {
						log.info({
							message:
								"Domain verification job already running; latest settings will be used",
							domainId: payload.domainId,
							state,
						});
						return;
					}
					await existing.remove();
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

		// Initialize webhook dispatcher (NATS queue group) + delivery worker
		await initWebhookSubscribers();
		startWebhookDeliveryWorker();

		// Product automations (drip / lifecycle sequences)
		await initAutomationSubscribers();
		startAutomationWorker();

		startWorkflowWorker();
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
