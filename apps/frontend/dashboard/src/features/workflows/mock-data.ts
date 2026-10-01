import type {
	CreateWorkflowInput,
	Workflow,
	WorkflowNode,
} from "./workflow-types";
import { TRIGGER_NODE_ID } from "./workflow-types";

const now = () => new Date().toISOString();

/** Horizontal center used so cards (420px wide) line up in a vertical column. */
const COLUMN_X = 220;
/** Trigger top (60) + Trigger height (~160) + 60px connection line = 280 */
const FIRST_ROW_Y = 280;
const STEP_GAP = 300;

export const createTriggerNode = (): WorkflowNode => ({
	id: TRIGGER_NODE_ID,
	type: "trigger",
	position: { x: COLUMN_X, y: 60 },
	data: {},
});

export const createSendEmailNode = (
	index: number,
	yOffset = 0,
): WorkflowNode => ({
	id: `send_email_${Date.now()}_${index}`,
	type: "send_email",
	position: { x: COLUMN_X, y: FIRST_ROW_Y + yOffset * STEP_GAP },
	data: {
		templateId: "",
	},
});

export const createDelayNode = (index: number, yOffset = 0): WorkflowNode => ({
	id: `delay_${Date.now()}_${index}`,
	type: "delay",
	position: { x: COLUMN_X, y: FIRST_ROW_Y + yOffset * STEP_GAP },
	data: {
		amount: 5,
		unit: "minutes",
	},
});

export const createConditionNode = (
	index: number,
	yOffset = 0,
): WorkflowNode => ({
	id: `condition_${Date.now()}_${index}`,
	type: "condition",
	position: { x: COLUMN_X, y: FIRST_ROW_Y + yOffset * STEP_GAP },
	data: {
		field: "status",
		operator: "eq",
		value: "subscribed",
	},
});

export const createAddStepNode = (sourceHandle?: string): WorkflowNode => ({
	id: `add_step_${Date.now()}`,
	type: "add_step",
	position: { x: COLUMN_X, y: 0 },
	data: {
		sourceHandle,
	},
});

/** Local-only helper for optimistic UI before API round-trip. */
export const createEmptyWorkflow = (input: CreateWorkflowInput): Workflow => {
	const timestamp = now();
	return {
		id: `wf_${Date.now()}`,
		organizationId: input.organizationId,
		name: input.name,
		description: input.description,
		status: "draft",
		nodes: [createTriggerNode()],
		edges: [],
		createdAt: timestamp,
		updatedAt: timestamp,
	};
};
