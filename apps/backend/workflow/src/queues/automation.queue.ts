import { workflowConfig } from "@be/workflow/workflow.config";
import { Queue, QueueEvents } from "bullmq";

export interface AutomationJobData {
	type: "run_step";
	enrollmentId: string;
	stepRunId: string;
	organizationId: string;
}

const connection = {
	url: workflowConfig.REDIS_URL,
};

export const AUTOMATION_QUEUE = "automation-queue";

export const automationQueue = new Queue<AutomationJobData>(AUTOMATION_QUEUE, {
	connection,
	defaultJobOptions: {
		attempts: 5,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
		removeOnComplete: { count: 200 },
		removeOnFail: { count: 500 },
	},
});

export const automationQueueEvents = new QueueEvents(AUTOMATION_QUEUE, {
	connection,
});

export function automationStepJobId(stepRunId: string): string {
	return `auto-step-${stepRunId}`;
}

export async function enqueueAutomationStep(params: {
	enrollmentId: string;
	stepRunId: string;
	organizationId: string;
	delayMs?: number;
}): Promise<void> {
	const jobId = automationStepJobId(params.stepRunId);
	const existing = await automationQueue.getJob(jobId);
	if (existing) {
		const state = await existing.getState();
		if (state === "active" || state === "waiting" || state === "delayed") {
			return;
		}
		await existing.remove().catch(() => undefined);
	}

	await automationQueue.add(
		"run_step",
		{
			type: "run_step",
			enrollmentId: params.enrollmentId,
			stepRunId: params.stepRunId,
			organizationId: params.organizationId,
		},
		{
			jobId,
			delay: Math.max(0, params.delayMs ?? 0),
		},
	);
}
