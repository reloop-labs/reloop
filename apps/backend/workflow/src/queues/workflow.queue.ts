import { workflowConfig } from "@be/workflow/workflow.config";
import { Queue, QueueEvents } from "bullmq";

export interface WorkflowJobData {
	workflowId: string;
	organizationId: string;
	type: string;
	payload: any;
}

const connection = {
	url: workflowConfig.REDIS_URL,
};

export const WORKFLOW_QUEUE = "workflow-queue";

export const workflowQueue = new Queue<WorkflowJobData>(
	WORKFLOW_QUEUE,
	{
		connection,
		defaultJobOptions: {
			attempts: 3,
			backoff: {
				type: "exponential",
				delay: 1000,
			},
			removeOnComplete: { count: 100 },
			removeOnFail: { count: 200 },
		},
	},
);

export const workflowQueueEvents = new QueueEvents(
	WORKFLOW_QUEUE,
	{ connection },
);
