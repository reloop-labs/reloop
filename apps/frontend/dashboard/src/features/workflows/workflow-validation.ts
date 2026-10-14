import {
	type ConditionNodeData,
	type DelayNodeData,
	isConditionNode,
	isDelayNode,
	isSendEmailNode,
	isTriggerNode,
	type SendEmailNodeData,
	TRIGGER_NODE_ID,
	type TriggerNodeData,
	type Workflow,
	type WorkflowNode,
} from "./workflow-types";

/** Operators that only check the field, never a value. */
export const VALUELESS_OPERATORS = new Set<string>([
	"exists",
	"not_exists",
	"is_empty",
]);

const hasConditionValue = (value: unknown) =>
	value !== undefined &&
	value !== null &&
	(typeof value !== "string" || value.trim() !== "");

/** A single rule, or every rule of an `and`/`or` group, is filled in. */
export const isConditionComplete = (data: Record<string, unknown>): boolean => {
	if (data.type === "and" || data.type === "or") {
		const rules = data.rules;
		return (
			Array.isArray(rules) &&
			rules.length > 0 &&
			rules.every(
				(rule) =>
					typeof rule === "object" &&
					rule !== null &&
					isConditionComplete(rule as Record<string, unknown>),
			)
		);
	}
	const field = typeof data.field === "string" ? data.field.trim() : "";
	const operator = typeof data.operator === "string" ? data.operator : "";
	if (!field || !operator) return false;
	return VALUELESS_OPERATORS.has(operator) || hasConditionValue(data.value);
};

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
		warnings.push("Automation must include a trigger node");
		return { isValid: false, warnings };
	}

	const eventKey =
		(typeof trigger.data.eventKey === "string" && trigger.data.eventKey) ||
		(typeof trigger.data.eventId === "string" ? trigger.data.eventId : "");
	if (!eventKey) {
		warnings.push("Select an event as the trigger");
	}

	const actionNodes = workflow.nodes.filter(
		(n) => isSendEmailNode(n) || isDelayNode(n) || isConditionNode(n),
	);
	if (actionNodes.length === 0) {
		warnings.push("Add at least one Delay, Condition, or Send email step");
	}

	const sendEmailNodes = workflow.nodes.filter(isSendEmailNode);
	const delayNodes = workflow.nodes.filter(isDelayNode);

	const reachable = getReachableNodeIds(workflow.nodes, workflow.edges);
	const disconnected = actionNodes.filter((n) => !reachable.has(n.id));
	if (disconnected.length > 0) {
		warnings.push("Connect the trigger to every step");
	}

	const unconfiguredSend = sendEmailNodes.filter((n) => {
		if (n.data.templateId?.trim()) return false;
		// Legacy nodes without a template still pass with To/From/Subject.
		return (
			!n.data.to?.trim() || !n.data.subject?.trim() || !n.data.from?.trim()
		);
	});
	if (unconfiguredSend.length > 0) {
		warnings.push("Select a template for each Send email step");
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
		warnings.push("Each Delay step needs a valid amount and unit");
	}

	const conditionNodes = workflow.nodes.filter(isConditionNode);
	const unconfiguredCondition = conditionNodes.filter(
		(n) => !isConditionComplete(n.data),
	);
	if (unconfiguredCondition.length > 0) {
		warnings.push("Complete field, operator, and value for each Condition");
	}

	const unconnectedCondition = conditionNodes.filter((n) => {
		const branches = workflow.edges.filter((e) => e.source === n.id);
		return !branches.some(
			(e) =>
				e.sourceHandle === "yes" || e.sourceHandle === "no" || e.data?.branch,
		);
	});
	if (unconnectedCondition.length > 0) {
		warnings.push("Connect a Yes or No path on each Condition");
	}

	const isValid = warnings.length === 0;
	return { isValid, warnings };
};

export const getNodeIssue = (
	node: Pick<WorkflowNode, "type" | "data">,
): string | null => {
	if (node.type === "trigger") {
		const data = node.data as TriggerNodeData;
		const eventKey =
			(typeof data.eventKey === "string" && data.eventKey) ||
			(typeof data.eventId === "string" ? data.eventId : "");
		return eventKey ? null : "Select an event";
	}

	if (node.type === "delay") {
		const data = node.data as DelayNodeData;
		const amount = Number(data.amount);
		const unit = data.unit;
		if (
			!Number.isFinite(amount) ||
			amount < 0 ||
			(unit !== "minutes" && unit !== "hours" && unit !== "days")
		) {
			return "Set a wait time";
		}
		return null;
	}

	if (node.type === "send_email") {
		const data = node.data as SendEmailNodeData;
		if (data.templateId?.trim()) return null;
		if (!data.to?.trim() || !data.subject?.trim() || !data.from?.trim()) {
			return "Select a template";
		}
		return null;
	}

	if (node.type === "condition") {
		const data = node.data as ConditionNodeData;
		if (isConditionComplete(data)) return null;
		if (data.type === "and" || data.type === "or") return "Complete every rule";
		if (!data.field?.trim() || !data.operator) return "Set a condition";
		return "Set a value";
	}

	return null;
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
		typeof eventKey === "string" && eventKey ? eventKey : "Not configured";
	const stepCount = workflow.nodes.filter(
		(n) => isSendEmailNode(n) || isDelayNode(n) || isConditionNode(n),
	).length;

	return { eventLabel, stepCount };
};
