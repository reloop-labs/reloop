import {
	isDelayNode,
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
	_nodes: WorkflowNode[],
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

	const eventKey =
		(typeof trigger.data.eventKey === "string" && trigger.data.eventKey) ||
		(typeof trigger.data.eventId === "string" ? trigger.data.eventId : "");
	if (!eventKey) {
		warnings.push("Select a workflow event as the trigger.");
	}

	const actionNodes = workflow.nodes.filter(
		(n) => isSendEmailNode(n) || isDelayNode(n),
	);
	if (actionNodes.length === 0) {
		warnings.push("Add at least one Delay or Send email step.");
	}

	const sendEmailNodes = workflow.nodes.filter(isSendEmailNode);
	const delayNodes = workflow.nodes.filter(isDelayNode);

	const reachable = getReachableNodeIds(workflow.nodes, workflow.edges);
	const disconnected = actionNodes.filter((n) => !reachable.has(n.id));
	if (disconnected.length > 0) {
		warnings.push("Connect the trigger to every step.");
	}

	const unconfiguredSend = sendEmailNodes.filter(
		(n) =>
			!n.data.to?.trim() ||
			!n.data.subject?.trim() ||
			!n.data.from?.trim(),
	);
	if (unconfiguredSend.length > 0) {
		warnings.push("Complete To, From, and Subject for each Send email step.");
	}

	const badDelays = delayNodes.filter((n) => {
		const amount = Number(n.data.amount);
		const unit = n.data.unit;
		return (
			!Number.isFinite(amount) ||
			amount < 0 ||
			(unit !== "minutes" && unit !== "hours" && unit !== "days")
		);
	});
	if (badDelays.length > 0) {
		warnings.push("Each Delay step needs a valid amount and unit.");
	}

	const isValid = warnings.length === 0;
	return { isValid, warnings };
};

export const getWorkflowSummary = (workflow: Workflow) => {
	const trigger = workflow.nodes.find((n) => n.id === TRIGGER_NODE_ID);
	const eventKey =
		trigger && isTriggerNode(trigger)
			? (trigger.data.eventKey ??
				trigger.data.eventName ??
				trigger.data.eventId)
			: workflow.triggerEvent;
	const eventLabel =
		typeof eventKey === "string" && eventKey
			? eventKey
			: "Not configured";
	const stepCount = workflow.nodes.filter(
		(n) => isSendEmailNode(n) || isDelayNode(n),
	).length;

	return { eventLabel, stepCount };
};
