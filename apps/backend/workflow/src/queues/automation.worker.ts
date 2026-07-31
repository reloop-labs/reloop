import { executeAutomationStep } from "@be/workflow/handlers/automation/execute-step";
import {
	AUTOMATION_QUEUE,
	type AutomationJobData,
} from "@be/workflow/queues/automation.queue";
import { workflowConfig } from "@be/workflow/workflow.config";
import { Worker } from "bullmq";
import { EvlogError, log } from "evlog";

const connection = {
	url: workflowConfig.REDIS_URL,
};

export function startAutomationWorker(): Worker {
	const worker = new Worker<AutomationJobData>(
		AUTOMATION_QUEUE,
		async (job) => {
			const { enrollmentId, stepRunId, organizationId, type } = job.data;
			if (type !== "run_step") {
				log.warn({ message: "Unknown automation job type", type });
				return;
			}

			log.info({
				message: "Processing automation step",
				enrollmentId,
				stepRunId,
				jobId: job.id,
			});

			await executeAutomationStep({
				enrollmentId,
				stepRunId,
				organizationId,
			});
		},
		{
			connection,
			concurrency: 10,
		},
	);

	worker.on("completed", (job) => {
		log.info({
			message: "Automation job completed",
			jobId: job.id,
			stepRunId: job.data.stepRunId,
		});
	});

	worker.on("failed", (job, err) => {
		log.error({
			message: "Automation job failed",
			jobId: job?.id,
			stepRunId: job?.data.stepRunId,
			error: err.message,
			...(err instanceof EvlogError && err.why ? { why: err.why } : {}),
		});
	});

	worker.on("error", (err) => {
		log.error({
			message: "Automation worker error",
			error: err.message,
		});
	});

	log.info("worker", "Automation worker started");
	return worker;
}
