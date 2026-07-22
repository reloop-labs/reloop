import { processDomainVerification } from "@be/workflow/handlers/domain-verification.handler";
import {
	DOMAIN_VERIFY_BACKOFF_TYPE,
	getDomainVerifyBackoffDelay,
} from "@be/workflow/queues/domain-verify-schedule";
import { isLastAttempt, type WorkflowJob } from "@be/workflow/queues/workflow-job";
import { workflowConfig } from "@be/workflow/workflow.config";
import { Worker } from "bullmq";
import { EvlogError, log } from "evlog";
import { WORKFLOW_QUEUE, type WorkflowJobData } from "./workflow.queue";

const connection = {
	url: workflowConfig.REDIS_URL,
};

async function processWorkflow(job: WorkflowJob): Promise<void> {
	const jobData = job.data;
	log.info({
		message: "Processing workflow job",
		workflowId: jobData.workflowId,
		type: jobData.type,
	});

	const lastAttempt = isLastAttempt(job);

	if (jobData.type === "verify-domain") {
		await processDomainVerification({
			job,
			domainId: jobData.workflowId,
			organizationId: jobData.organizationId,
			isLastAttempt: lastAttempt,
		});
	} else if (jobData.type === "deliver-webhook") {
		// Legacy jobs on workflow-queue — log and skip (delivery moved to
		// webhook-delivery-queue). Safe no-op so old jobs drain without crash.
		log.warn({
			message:
				"Ignoring legacy deliver-webhook job on workflow-queue; use webhook-delivery-queue",
			workflowId: jobData.workflowId,
			payload: jobData.payload,
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
			settings: {
				backoffStrategy: (attemptsMade, type) => {
					if (type === DOMAIN_VERIFY_BACKOFF_TYPE) {
						return getDomainVerifyBackoffDelay(attemptsMade);
					}
					// Built-in exponential/fixed strategies are used for other types.
					return 0;
				},
			},
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
			...(err instanceof EvlogError && err.why ? { why: err.why } : {}),
			...(err instanceof EvlogError && err.fix ? { fix: err.fix } : {}),
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
