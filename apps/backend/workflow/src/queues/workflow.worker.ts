import { processDomainVerification } from "@be/workflow/handlers/domain-verification.handler";
import { processWebhookDelivery } from "@be/workflow/handlers/webhook-delivery.handler";
import { workflowConfig } from "@be/workflow/workflow.config";
import { type Job, Worker } from "bullmq";
import { log } from "evlog";
import { WORKFLOW_QUEUE, type WorkflowJobData } from "./workflow.queue";

const connection = {
	url: workflowConfig.REDIS_URL,
};

async function processWorkflow(job: Job<WorkflowJobData>): Promise<void> {
	const jobData = job.data;
	log.info({
		message: "Processing workflow job",
		workflowId: jobData.workflowId,
		type: jobData.type,
	});

	const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

	if (jobData.type === "verify-domain") {
		await processDomainVerification({
			domainId: jobData.workflowId,
			organizationId: jobData.organizationId,
			isLastAttempt,
		});
	} else if (jobData.type === "deliver-webhook") {
		await processWebhookDelivery({
			deliveryId: jobData.payload.deliveryId as string,
			webhookId: jobData.payload.webhookId as string,
			webhookUrl: jobData.payload.webhookUrl as string,
			webhookSecret: jobData.payload.webhookSecret as string,
			customHeaders: jobData.payload.customHeaders as Record<string, string> | null,
			eventId: jobData.payload.eventId as string,
			eventType: jobData.payload.eventType as string,
			payload: jobData.payload.payload as Record<string, unknown>,
			isLastAttempt,
		});
	}

	log.info({
		message: "Workflow job processed",
		workflowId: jobData.workflowId,
	});
}

export function startWorkflowWorker(): Worker {
	const worker = new Worker<WorkflowJobData>(
		WORKFLOW_QUEUE,
		async (job) => {
			await processWorkflow(job);
		},
		{
			connection,
			concurrency: 5,
		},
	);

	worker.on("completed", (job) => {
		log.info({
			message: "Workflow job completed",
			jobId: job.id,
			workflowId: job.data.workflowId,
		});
	});

	worker.on("failed", (job, err) => {
		log.error({
			message: "Workflow job failed",
			jobId: job?.id,
			workflowId: job?.data.workflowId,
			error: err.message,
		});
	});

	worker.on("error", (err) => {
		log.error({
			message: "Workflow worker error",
			error: err.message,
		});
	});

	log.info("worker", "Workflow worker started");
	return worker;
}
