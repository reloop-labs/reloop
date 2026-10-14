import {
	type ConditionConfig,
	parseConditionData,
} from "@be/workflow/lib/automation/condition";
import {
	type DelayUnit,
	findTriggerNode,
	TRIGGER_NODE_ID,
} from "@be/workflow/lib/automation/graph";
import { ensureTriggerPrefix } from "@be/workflow/lib/custom-event/key";
import type { AutomationGraph } from "@reloop/db/schema";

/**
 * Public API shape of an automation: named steps plus the connections between
 * them. It's stored as the dashboard's canvas graph (nodes + edges), so these
 * helpers convert both ways.
 */

export const STEP_TYPES = [
	"trigger",
	"send_email",
	"delay",
	"condition",
] as const;
export type StepType = (typeof STEP_TYPES)[number];

export type TriggerStepConfig = { eventName: string };
export type SendEmailStepConfig = {
	template: { id: string };
	/** Used when the template has no From. */
	from?: string;
	/** Used when the template has no subject. */
	subject?: string;
};
export type DelayStepConfig = { amount: number; unit: DelayUnit };
/** A single `rule`, or `and`/`or` over nested rules. */
export type ConditionStepConfig = ConditionConfig;

export type AutomationStep =
	| { key: string; type: "trigger"; config: TriggerStepConfig }
	| { key: string; type: "send_email"; config: SendEmailStepConfig }
	| { key: string; type: "delay"; config: DelayStepConfig }
	| { key: string; type: "condition"; config: ConditionStepConfig };

export const CONNECTION_TYPES = [
	"default",
	"condition_met",
	"condition_not_met",
] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export type AutomationConnection = {
	from: string;
	to: string;
	/** `condition_met` / `condition_not_met` on connections leaving a condition. */
	type: ConnectionType;
};

/** Stored edge handle for each side of a condition. */
const BRANCH_OF = { condition_met: "yes", condition_not_met: "no" } as const;

/** Loose input as it arrives over the API (validated by `stepsToGraph`). */
export type StepInput = {
	key: string;
	type: string;
	config?: Record<string, unknown>;
};
export type ConnectionInput = {
	from: string;
	to: string;
	/** Defaults to `default`. */
	type?: string;
};

const KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const DELAY_UNITS = new Set(["minutes", "hours", "days"]);

const str = (value: unknown) =>
	typeof value === "string" ? value.trim() : undefined;

/** Builds a step's node data from its config; pushes problems to `errors`. */
function configToData(
	step: StepInput,
	errors: string[],
): Record<string, unknown> {
	const config = step.config ?? {};
	const at = `Step "${step.key}"`;

	switch (step.type) {
		case "trigger": {
			// `event_name` too, for clients that send snake_case.
			const eventName = str(config.eventName) ?? str(config.event_name);
			if (!eventName) errors.push(`${at}: config.eventName is required.`);
			return eventName ? { eventKey: ensureTriggerPrefix(eventName) } : {};
		}
		case "send_email": {
			const template = config.template as { id?: unknown } | undefined;
			const templateId = str(template?.id);
			if (!templateId) errors.push(`${at}: config.template.id is required.`);
			const data: Record<string, unknown> = { templateId: templateId ?? "" };
			const from = str(config.from);
			if (from) data.from = from;
			const subject = str(config.subject);
			if (subject) data.subject = subject;
			return data;
		}
		case "delay": {
			const amount = Number(config.amount);
			const unit = config.unit;
			if (
				config.amount === undefined ||
				!Number.isFinite(amount) ||
				amount < 0
			) {
				errors.push(`${at}: config.amount must be a number of 0 or more.`);
			}
			if (typeof unit !== "string" || !DELAY_UNITS.has(unit)) {
				errors.push(`${at}: config.unit must be "minutes", "hours" or "days".`);
			}
			return { amount, unit };
		}
		case "condition": {
			try {
				const condition = parseConditionData(config);
				// A single rule is stored flat, the way the dashboard edits it.
				if (condition.type === "rule") {
					const { type: _rule, ...flat } = condition;
					return flat;
				}
				return condition;
			} catch (e) {
				errors.push(`${at}: ${e instanceof Error ? e.message : String(e)}`);
				return {};
			}
		}
		default:
			return {};
	}
}

/**
 * Turns API steps + connections into the stored graph. Throws a list of
 * readable problems (all of them, not just the first) when the input isn't a
 * flow the dashboard can draw and the engine can run.
 */
export function stepsToGraph(
	steps: StepInput[],
	connections: ConnectionInput[] = [],
): { ok: true; graph: AutomationGraph } | { ok: false; errors: string[] } {
	const errors: string[] = [];
	const byKey = new Map<string, StepInput>();

	for (const step of steps) {
		if (typeof step.key !== "string" || !KEY_PATTERN.test(step.key)) {
			errors.push(
				`Step key "${step.key}" must be 1-64 letters, numbers, "_" or "-".`,
			);
			continue;
		}
		if (byKey.has(step.key)) {
			errors.push(`Step key "${step.key}" is used more than once.`);
			continue;
		}
		if (!(STEP_TYPES as readonly string[]).includes(step.type)) {
			errors.push(
				`Step "${step.key}": type must be one of ${STEP_TYPES.join(", ")}.`,
			);
		}
		byKey.set(step.key, step);
	}

	const triggers = steps.filter((s) => s.type === "trigger");
	if (triggers.length !== 1) {
		errors.push('Add exactly one step with type "trigger".');
	}
	const triggerKey = triggers[0]?.key;
	for (const step of steps) {
		// The trigger is stored under a fixed id the dashboard relies on.
		if (step.key === TRIGGER_NODE_ID && step.type !== "trigger") {
			errors.push(
				`Step key "${TRIGGER_NODE_ID}" is reserved for the trigger step.`,
			);
		}
	}

	const nodeId = (key: string) => (key === triggerKey ? TRIGGER_NODE_ID : key);
	const nodes: AutomationGraph["nodes"] = [];
	for (const step of byKey.values()) {
		const data = configToData(step, errors);
		if (step.type === "trigger") data.key = step.key;
		nodes.push({
			id: nodeId(step.key),
			type: step.type,
			// The dashboard lays steps out itself.
			position: { x: 0, y: 0 },
			data,
		});
	}

	const edges: AutomationGraph["edges"] = [];
	const outgoing = new Set<string>();
	const incoming = new Set<string>();
	for (const connection of connections) {
		const { from, to } = connection;
		const label = `Connection "${from}" → "${to}"`;
		const source = byKey.get(from);
		const target = byKey.get(to);
		if (!source) errors.push(`${label}: no step with key "${from}".`);
		if (!target) errors.push(`${label}: no step with key "${to}".`);
		if (!source || !target) continue;
		if (from === to) {
			errors.push(`${label}: a step can't connect to itself.`);
			continue;
		}
		if (target.type === "trigger") {
			errors.push(`${label}: nothing can connect into the trigger.`);
			continue;
		}

		const type = connection.type ?? "default";
		let branch: "yes" | "no" | undefined;
		if (source.type === "condition") {
			if (type !== "condition_met" && type !== "condition_not_met") {
				errors.push(
					`${label}: connections from a condition need type "condition_met" or "condition_not_met".`,
				);
				continue;
			}
			branch = BRANCH_OF[type];
		} else if (type !== "default") {
			errors.push(
				`${label}: type must be "default" (only a condition has "condition_met" / "condition_not_met").`,
			);
			continue;
		}

		const exit = `${from}:${branch ?? ""}`;
		if (outgoing.has(exit)) {
			errors.push(
				branch
					? `Step "${from}" has more than one "${type}" connection.`
					: `Step "${from}" has more than one next step.`,
			);
			continue;
		}
		if (incoming.has(to)) {
			errors.push(`Step "${to}" has more than one incoming connection.`);
			continue;
		}
		outgoing.add(exit);
		incoming.add(to);

		const source_ = nodeId(from);
		const target_ = nodeId(to);
		edges.push({
			id: `e_${source_}_${target_}`,
			source: source_,
			target: target_,
			...(branch ? { sourceHandle: branch } : {}),
			type: "flow",
			data: {
				tone: branch === "yes" ? "accent" : "default",
				...(branch ? { branch } : {}),
			},
		});
	}

	if (hasCycle(edges)) {
		errors.push("Connections can't loop back to an earlier step.");
	}

	if (errors.length > 0) return { ok: false, errors };
	return { ok: true, graph: { nodes, edges } };
}

function hasCycle(edges: AutomationGraph["edges"]): boolean {
	const next = new Map<string, string[]>();
	for (const e of edges)
		next.set(e.source, [...(next.get(e.source) ?? []), e.target]);
	const state = new Map<string, "visiting" | "done">();
	const visit = (id: string): boolean => {
		if (state.get(id) === "visiting") return true;
		if (state.get(id) === "done") return false;
		state.set(id, "visiting");
		for (const n of next.get(id) ?? []) if (visit(n)) return true;
		state.set(id, "done");
		return false;
	};
	return [...next.keys()].some((id) => visit(id));
}

/** A stored condition as API config (an unfinished one comes back as-is). */
function readCondition(data: Record<string, unknown>): ConditionStepConfig {
	try {
		return parseConditionData(data);
	} catch {
		const rule: Record<string, unknown> = {
			type: "rule",
			field: str(data.field) ?? "",
			operator: data.operator ?? "",
		};
		if (data.value !== undefined && data.value !== "") rule.value = data.value;
		return rule as ConditionStepConfig;
	}
}

/** Step key of a stored node (the trigger keeps the key it was created with). */
function keyOf(node: AutomationGraph["nodes"][number]): string {
	if (node.type === "trigger" && typeof node.data?.key === "string") {
		return node.data.key;
	}
	return node.id;
}

/** Reads the stored graph back as API steps + connections. */
export function graphToSteps(graph: AutomationGraph): {
	steps: AutomationStep[];
	connections: AutomationConnection[];
} {
	const keys = new Map<string, string>();
	const steps: AutomationStep[] = [];

	for (const node of graph.nodes ?? []) {
		const data = node.data ?? {};
		const key = keyOf(node);
		if (node.type === "trigger") {
			const eventName = str(data.eventKey) || str(data.eventId) || "";
			steps.push({ key, type: "trigger", config: { eventName } });
		} else if (node.type === "send_email") {
			const config: SendEmailStepConfig = {
				template: { id: str(data.templateId) ?? "" },
			};
			if (str(data.from)) config.from = str(data.from);
			if (str(data.subject)) config.subject = str(data.subject);
			steps.push({ key, type: "send_email", config });
		} else if (node.type === "delay") {
			steps.push({
				key,
				type: "delay",
				config: {
					amount: Number(data.amount),
					unit: data.unit as DelayUnit,
				},
			});
		} else if (node.type === "condition") {
			steps.push({ key, type: "condition", config: readCondition(data) });
		} else {
			// UI-only nodes (e.g. an unsaved "add step" placeholder) aren't steps.
			continue;
		}
		keys.set(node.id, key);
	}

	const trigger = findTriggerNode(graph);
	if (trigger && !keys.has(trigger.id)) keys.set(trigger.id, keyOf(trigger));

	const connections: AutomationConnection[] = [];
	for (const edge of graph.edges ?? []) {
		const from = keys.get(edge.source);
		const to = keys.get(edge.target);
		if (!from || !to) continue;
		const branch =
			edge.sourceHandle === "yes" || edge.sourceHandle === "no"
				? edge.sourceHandle
				: edge.data?.branch;
		const type: ConnectionType =
			branch === "yes"
				? "condition_met"
				: branch === "no"
					? "condition_not_met"
					: "default";
		connections.push({ from, to, type });
	}

	return { steps, connections };
}
