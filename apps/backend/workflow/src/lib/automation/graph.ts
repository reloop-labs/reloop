import type { AutomationGraph } from "@reloop/db/schema";

export const TRIGGER_NODE_ID = "trigger";

export type DelayUnit = "minutes" | "hours" | "days";

export type DelayNodeData = {
	amount: number;
	unit: DelayUnit;
};

export type SendEmailNodeData = {
	to: string;
	subject: string;
	from?: string;
	templateId?: string;
	html?: string;
	text?: string;
};

export type GraphNode = AutomationGraph["nodes"][number];
export type GraphEdge = AutomationGraph["edges"][number];

export function emptyGraph(): AutomationGraph {
	return {
		nodes: [
			{
				id: TRIGGER_NODE_ID,
				type: "trigger",
				position: { x: 220, y: 60 },
				data: {},
			},
		],
		edges: [],
	};
}

/**
 * Resolve the custom event key from the trigger node.
 * Prefers `eventKey`; falls back to `eventId` for older drafts.
 */
export function extractTriggerEvent(
	graph: AutomationGraph,
): string | undefined {
	const trigger = graph.nodes.find(
		(n) => n.id === TRIGGER_NODE_ID || n.type === "trigger",
	);
	const eventKey = trigger?.data?.eventKey;
	if (typeof eventKey === "string" && eventKey.length > 0) return eventKey;
	const eventId = trigger?.data?.eventId;
	return typeof eventId === "string" && eventId.length > 0
		? eventId
		: undefined;
}

export function getOutgoingTargets(
	graph: AutomationGraph,
	nodeId: string,
): string[] {
	return graph.edges.filter((e) => e.source === nodeId).map((e) => e.target);
}

export function findNode(
	graph: AutomationGraph,
	nodeId: string,
): GraphNode | undefined {
	return graph.nodes.find((n) => n.id === nodeId);
}

/** First action node(s) after the trigger (linear sequences take the first edge). */
export function getFirstActionNodeIds(graph: AutomationGraph): string[] {
	return getOutgoingTargets(graph, TRIGGER_NODE_ID);
}

export function parseDelayData(data: Record<string, unknown>): DelayNodeData {
	const amount = Number(data.amount);
	const unit = data.unit as DelayUnit;
	if (!Number.isFinite(amount) || amount < 0) {
		throw new Error("Delay amount must be a non-negative number");
	}
	if (unit !== "minutes" && unit !== "hours" && unit !== "days") {
		throw new Error("Delay unit must be minutes, hours, or days");
	}
	return { amount, unit };
}

export function delayToMs(data: DelayNodeData): number {
	const mult =
		data.unit === "days"
			? 86_400_000
			: data.unit === "hours"
				? 3_600_000
				: 60_000;
	return Math.max(0, Math.floor(data.amount * mult));
}

export interface GraphValidationResult {
	isValid: boolean;
	errors: string[];
	triggerEvent?: string;
}

export function validateAutomationGraph(
	graph: AutomationGraph,
): GraphValidationResult {
	const errors: string[] = [];
	const trigger = graph.nodes.find(
		(n) => n.id === TRIGGER_NODE_ID || n.type === "trigger",
	);

	if (!trigger) {
		errors.push("Workflow must include a trigger node.");
		return { isValid: false, errors };
	}

	// Custom event key (org-defined), not a platform webhook-events id
	const eventId =
		typeof trigger.data?.eventKey === "string" && trigger.data.eventKey
			? trigger.data.eventKey
			: typeof trigger.data?.eventId === "string"
				? trigger.data.eventId
				: "";
	if (!eventId) {
		errors.push("Select a custom event trigger.");
	}

	const actionNodes = graph.nodes.filter(
		(n) => n.type === "delay" || n.type === "send_email",
	);
	if (actionNodes.length === 0) {
		errors.push("Add at least one Delay or Send email step.");
	}

	const reachable = new Set<string>();
	const stack = [TRIGGER_NODE_ID];
	const adjacency = new Map<string, string[]>();
	for (const edge of graph.edges) {
		const targets = adjacency.get(edge.source) ?? [];
		targets.push(edge.target);
		adjacency.set(edge.source, targets);
	}
	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || reachable.has(id)) continue;
		reachable.add(id);
		for (const next of adjacency.get(id) ?? []) {
			if (!reachable.has(next)) stack.push(next);
		}
	}

	const disconnected = actionNodes.filter((n) => !reachable.has(n.id));
	if (disconnected.length > 0) {
		errors.push("Connect the trigger to every step.");
	}

	for (const node of graph.nodes) {
		if (node.type === "delay") {
			try {
				parseDelayData(node.data ?? {});
			} catch (e) {
				errors.push(
					`Delay step "${node.id}": ${e instanceof Error ? e.message : String(e)}`,
				);
			}
		}
		if (node.type === "send_email") {
			const to = String(node.data?.to ?? "").trim();
			const subject = String(node.data?.subject ?? "").trim();
			if (!to) errors.push(`Send email step "${node.id}" needs a To address.`);
			if (!subject)
				errors.push(`Send email step "${node.id}" needs a Subject.`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		triggerEvent: eventId || undefined,
	};
}
