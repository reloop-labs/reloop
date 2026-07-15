import { workflowQueue } from "@be/workflow/queues/workflow.queue";
import { workflowConfig } from "@be/workflow/workflow.config";
import { workbench } from "@getworkbench/elysia";

/** Public URL path (includes service prefix) — used for base href + alert links. */
export const WORKBENCH_PATH = "/api/workflow/jobs";

const auth =
	workflowConfig.WORKBENCH_USER && workflowConfig.WORKBENCH_PASS
		? {
				username: workflowConfig.WORKBENCH_USER,
				password: workflowConfig.WORKBENCH_PASS,
			}
		: undefined;

/**
 * BullMQ Workbench dashboard, mounted on the same Redis + queue as the worker.
 * Visit: {BASE_URL}/api/workflow/jobs  (or http://localhost:8017/api/workflow/jobs)
 */
export const workbenchApp = workbench({
	queues: [workflowQueue],
	basePath: WORKBENCH_PATH,
	title: "Reloop · Workflow",
	// Filterable fields from WorkflowJobData
	tags: ["type", "organizationId", "workflowId"],
	auth,
	alerts: {
		dashboardUrl: `${workflowConfig.BASE_URL}${WORKBENCH_PATH}`,
	},
});
