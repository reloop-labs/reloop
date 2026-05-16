import { workflowConfig } from "@be/workflow/workflow.config";
import { Worker } from "bullmq";
import { log } from "evlog";
import {
	WORKFLOW_QUEUE,
	type WorkflowJobData,
} from "./workflow.queue";

const connection = {
	url: workflowConfig.REDIS_URL,
};

async function processWorkflow(
	jobData: WorkflowJobData,
): Promise<void> {
	log.info({ message: "Processing workflow job", workflowId: jobData.workflowId, type: jobData.type });
	
	// Implementation will go here
	
	log.info({ message: "Workflow job processed", workflowId: jobData.workflowId });
}

export function startWorkflowWorker(): Worker {
	const worker = new Worker<WorkflowJobData>(
		WORKFLOW_QUEUE,
		async (job) => {
			await processWorkflow(job.data);
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
