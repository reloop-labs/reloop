import { WEBHOOK_EVENTS_BY_ID } from "@reloop/webhook-events";
import {
	isSendEmailNode,
	isTriggerNode,
	TRIGGER_NODE_ID,
	type Workflow,
	type WorkflowNode,
} from "./workflow-types";

export interface WorkflowValidationResult {
	isValid: boolean;
	warnings: string[];
}

const getReachableNodeIds = (
	nodes: WorkflowNode[],
	edges: Workflow["edges"],
): Set<string> => {
	const adjacency = new Map<string, string[]>();
	for (const edge of edges) {
		const targets = adjacency.get(edge.source) ?? [];
		targets.push(edge.target);
		adjacency.set(edge.source, targets);
	}

	const visited = new Set<string>();
	const stack = [TRIGGER_NODE_ID];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || visited.has(id)) continue;
		visited.add(id);
		const neighbors = adjacency.get(id) ?? [];
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) stack.push(neighbor);
		}
	}

	return visited;
};

export const validateWorkflow = (
	workflow: Workflow,
): WorkflowValidationResult => {
	const warnings: string[] = [];
	const trigger = workflow.nodes.find((n) => n.id === TRIGGER_NODE_ID);

	if (!trigger || !isTriggerNode(trigger)) {
		warnings.push("Workflow must include a trigger node.");
		return { isValid: false, warnings };
	}

	if (!trigger.data.eventId) {
		warnings.push("Select an email event for the trigger.");
	}

	const sendEmailNodes = workflow.nodes.filter(isSendEmailNode);
	if (sendEmailNodes.length === 0) {
		warnings.push("Add at least one Send email step.");
	}

	const reachable = getReachableNodeIds(workflow.nodes, workflow.edges);
	const disconnectedSend = sendEmailNodes.filter((n) => !reachable.has(n.id));
	if (disconnectedSend.length > 0) {
		warnings.push("Connect the trigger to every Send email step.");
	}

	const unconfiguredSend = sendEmailNodes.filter(
		(n) => !n.data.to?.trim() || !n.data.subject?.trim(),
	);
	if (unconfiguredSend.length > 0) {
		warnings.push("Complete To and Subject for each Send email step.");
	}

	const isValid = warnings.length === 0;
	return { isValid, warnings };
};

export const getWorkflowSummary = (workflow: Workflow) => {
	const trigger = workflow.nodes.find((n) => n.id === TRIGGER_NODE_ID);
	const eventId =
		trigger && isTriggerNode(trigger) ? trigger.data.eventId : undefined;
	const eventLabel = eventId
		? (WEBHOOK_EVENTS_BY_ID.get(eventId)?.name ?? eventId)
		: "Not configured";
	const stepCount = workflow.nodes.filter(isSendEmailNode).length;

	return { eventLabel, stepCount };
};
