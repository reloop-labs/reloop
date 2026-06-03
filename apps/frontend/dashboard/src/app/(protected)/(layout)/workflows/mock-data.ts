import type { CreateWorkflowInput, Workflow, WorkflowNode } from "./workflow-types";
import { TRIGGER_NODE_ID } from "./workflow-types";

const now = () => new Date().toISOString();

export const createTriggerNode = (): WorkflowNode => ({
	id: TRIGGER_NODE_ID,
	type: "trigger",
	position: { x: 80, y: 200 },
	data: {},
});

export const createSendEmailNode = (index: number, yOffset = 0): WorkflowNode => ({
	id: `send_email_${Date.now()}_${index}`,
	type: "send_email",
	position: { x: 380, y: 120 + yOffset * 140 },
	data: {
		to: "",
		subject: "",
	},
});

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

export const seedWorkflows = (organizationId: string): Workflow[] => {
	const timestamp = now();
	const welcomeSendId = "send_email_welcome";

	return [
		{
			id: "wf_mock_welcome",
			organizationId,
			name: "Welcome on delivery",
			description: "Send a follow-up when an email is delivered",
			status: "active",
			nodes: [
				{
					id: TRIGGER_NODE_ID,
					type: "trigger",
					position: { x: 80, y: 200 },
					data: { eventId: "email.delivered" },
				},
				{
					id: welcomeSendId,
					type: "send_email",
					position: { x: 380, y: 200 },
					data: {
						to: "{{contact.email}}",
						subject: "Thanks for reading!",
						from: "hello@yourdomain.com",
					},
				},
			],
			edges: [
				{
					id: "e_trigger_welcome",
					source: TRIGGER_NODE_ID,
					target: welcomeSendId,
				},
			],
			createdAt: timestamp,
			updatedAt: timestamp,
		},
		{
			id: "wf_mock_bounce",
			organizationId,
			name: "Bounce alert",
			description: "Notify your team when delivery fails",
			status: "draft",
			nodes: [
				{
					id: TRIGGER_NODE_ID,
					type: "trigger",
					position: { x: 80, y: 200 },
					data: { eventId: "email.bounced" },
				},
				{
					id: "send_email_alert",
					type: "send_email",
					position: { x: 380, y: 200 },
					data: {
						to: "ops@yourdomain.com",
						subject: "Email bounced",
					},
				},
			],
			edges: [
				{
					id: "e_trigger_alert",
					source: TRIGGER_NODE_ID,
					target: "send_email_alert",
				},
			],
			createdAt: timestamp,
			updatedAt: timestamp,
		},
	];
};

export const getStorageKey = (orgSlug: string) => `workflows:${orgSlug}`;
