import type { AutomationGraph } from "@reloop/db/schema";

export const CONDITION_OPERATORS = [
	"eq",
	"neq",
	"contains",
	"exists",
	"not_exists",
	"gt",
	"lt",
] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

export type ConditionNodeData = {
	field: string;
	operator: ConditionOperator;
	value?: string;
};

const OPERATORS = new Set<string>(CONDITION_OPERATORS);

export function parseConditionData(
	data: Record<string, unknown>,
): ConditionNodeData {
	const field = String(data.field ?? "").trim();
	if (!field) {
		throw new Error("Condition needs a field to check.");
	}
	const operator = String(data.operator ?? "").trim();
	if (!OPERATORS.has(operator)) {
		throw new Error("Condition operator is invalid.");
	}
	const value = data.value == null ? "" : String(data.value);
	if (
		operator !== "exists" &&
		operator !== "not_exists" &&
		value.trim() === ""
	) {
		throw new Error("Condition needs a value to compare.");
	}
	return {
		field,
		operator: operator as ConditionOperator,
		value,
	};
}

export function getBranchTarget(
	graph: AutomationGraph,
	nodeId: string,
	branch: "yes" | "no",
): string | undefined {
	const match = graph.edges.find((edge) => {
		if (edge.source !== nodeId) return false;
		if (edge.sourceHandle === branch) return true;
		const dataBranch = edge.data?.branch;
		return dataBranch === branch;
	});
	return match?.target;
}

/**
 * Resolve a stored field path against a flat vars map.
 * `email`, `event.plan`, and `property.plan` are looked up as written.
 */
export function evaluateCondition(
	condition: ConditionNodeData,
	vars: Record<string, string | null | undefined>,
): boolean {
	const actual = vars[condition.field];
	const hasValue = actual != null && String(actual).trim() !== "";
	const actualStr = hasValue ? String(actual) : "";
	const expected = condition.value ?? "";

	switch (condition.operator) {
		case "exists":
			return hasValue;
		case "not_exists":
			return !hasValue;
		case "eq":
			return normalize(actualStr) === normalize(expected);
		case "neq":
			return normalize(actualStr) !== normalize(expected);
		case "contains":
			return normalize(actualStr).includes(normalize(expected));
		case "gt":
			return compareNumbers(actualStr, expected) > 0;
		case "lt":
			return compareNumbers(actualStr, expected) < 0;
		default:
			return false;
	}
}

function normalize(value: string): string {
	return value.trim().toLowerCase();
}

function compareNumbers(left: string, right: string): number {
	const a = Number(left);
	const b = Number(right);
	if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}
