import { processWebhookDelivery } from "@be/workflow/handlers/webhook-delivery.handler";
import { isLastAttempt, type WorkflowJob } from "@be/workflow/queues/workflow-job";
import {
	WEBHOOK_DELIVERY_QUEUE,
	getWebhookRetryDelayMs,
	WEBHOOK_RETRY_BACKOFF_TYPE,
	type WebhookDeliveryJobData,
} from "@reloop/webhook-delivery";
import { workflowConfig } from "@be/workflow/workflow.config";
import { Worker } from "bullmq";
import { EvlogError, log } from "evlog";

const connection = {
	url: workflowConfig.REDIS_URL,
};

export function startWebhookDeliveryWorker(): Worker {
	const worker = new Worker<WebhookDeliveryJobData>(
		WEBHOOK_DELIVERY_QUEUE,
		async (job) => {
			const lastAttempt = isLastAttempt(job as unknown as WorkflowJob);
			await processWebhookDelivery({
				job: job as unknown as WorkflowJob,
				deliveryId: job.data.deliveryId,
				isLastAttempt: lastAttempt,
				attemptNumber: job.attemptsMade + 1,
			});
		},
		{
			connection,
			concurrency: 10,
			settings: {
				backoffStrategy: (attemptsMade, type) => {
					if (type === WEBHOOK_RETRY_BACKOFF_TYPE) {
						return getWebhookRetryDelayMs(attemptsMade);
					}
					return 0;
				},
			},
		},
	);

	worker.on("completed", (job) => {
		log.info({
			message: "Webhook delivery job completed",
			jobId: job.id,
			deliveryId: job.data.deliveryId,
		});
	});

	worker.on("failed", (job, err) => {
		log.error({
			message: "Webhook delivery job failed",
			jobId: job?.id,
			deliveryId: job?.data.deliveryId,
			error: err.message,
			...(err instanceof EvlogError && err.why ? { why: err.why } : {}),
			...(err instanceof EvlogError && err.fix ? { fix: err.fix } : {}),
		});
	});

	worker.on("error", (err) => {
		log.error({
			message: "Webhook delivery worker error",
			error: err.message,
		});
	});

	log.info("worker", "Webhook delivery worker started");
	return worker;
}
