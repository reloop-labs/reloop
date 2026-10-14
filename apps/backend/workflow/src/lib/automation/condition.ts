import type { AutomationGraph } from "@reloop/db/schema";

export const CONDITION_OPERATORS = [
	"eq",
	"neq",
	"gt",
	"gte",
	"lt",
	"lte",
	"contains",
	"starts_with",
	"ends_with",
	"exists",
	"not_exists",
	"is_empty",
] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

/** Operators that only look at the field, never at `value`. */
const VALUELESS = new Set<string>(["exists", "not_exists", "is_empty"]);

/** A fixed value, or a reference to another field (`{ var: "event.order_id" }`). */
export type ConditionValue = string | number | boolean | null | { var: string };

export type ConditionRule = {
	type: "rule";
	field: string;
	operator: ConditionOperator;
	value?: ConditionValue;
};

export type ConditionGroup = {
	type: "and" | "or";
	rules: ConditionConfig[];
};

export type ConditionConfig = ConditionRule | ConditionGroup;

/** @deprecated Single-rule shape the dashboard stores; same as a `rule`. */
export type ConditionNodeData = ConditionConfig;

const OPERATORS = new Set<string>(CONDITION_OPERATORS);
const MAX_DEPTH = 4;

const isVarRef = (value: unknown): value is { var: string } =>
	typeof value === "object" &&
	value !== null &&
	!Array.isArray(value) &&
	typeof (value as { var?: unknown }).var === "string";

function parseValue(raw: unknown): ConditionValue | undefined {
	if (raw === undefined) return undefined;
	if (raw === null) return null;
	if (
		typeof raw === "string" ||
		typeof raw === "number" ||
		typeof raw === "boolean"
	) {
		return raw;
	}
	if (isVarRef(raw)) {
		const ref = raw.var.trim();
		if (!ref) throw new Error("Condition value { var } needs a field name.");
		return { var: ref };
	}
	throw new Error(
		'Condition value must be a string, number, boolean, null or { "var": "<field>" }.',
	);
}

function parseConfig(
	data: Record<string, unknown>,
	depth: number,
): ConditionConfig {
	const type = data.type ?? "rule";
	if (type === "and" || type === "or") {
		if (depth >= MAX_DEPTH) {
			throw new Error(`Condition groups can nest at most ${MAX_DEPTH} levels.`);
		}
		const rules = data.rules;
		if (!Array.isArray(rules) || rules.length === 0) {
			throw new Error(`An "${type}" condition needs at least one rule.`);
		}
		return {
			type,
			rules: rules.map((rule) => {
				if (typeof rule !== "object" || rule === null || Array.isArray(rule)) {
					throw new Error("Each condition rule must be an object.");
				}
				return parseConfig(rule as Record<string, unknown>, depth + 1);
			}),
		};
	}
	if (type !== "rule") {
		throw new Error('Condition type must be "rule", "and" or "or".');
	}

	const field = String(data.field ?? "").trim();
	if (!field) {
		throw new Error("Condition needs a field to check.");
	}
	const operator = String(data.operator ?? "").trim();
	if (!OPERATORS.has(operator)) {
		throw new Error("Condition operator is invalid.");
	}
	const value = parseValue(data.value);
	if (
		!VALUELESS.has(operator) &&
		(value === undefined ||
			value === null ||
			(typeof value === "string" && value.trim() === ""))
	) {
		throw new Error("Condition needs a value to compare.");
	}
	return {
		type: "rule",
		field,
		operator: operator as ConditionOperator,
		value: VALUELESS.has(operator) ? "" : value,
	};
}

/**
 * Reads a condition step's config: a single `rule` (also the older flat
 * `{ field, operator, value }` the dashboard stores) or an `and`/`or` group.
 */
export function parseConditionData(
	data: Record<string, unknown>,
): ConditionConfig {
	return parseConfig(data, 0);
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

type Vars = Record<string, string | null | undefined>;

/**
 * Evaluates a condition against a flat vars map (`contact.email`,
 * `trigger.plan`, `event.plan`, …). Field paths are looked up as written.
 * A `{ var }` value that points at missing data never matches.
 */
export function evaluateCondition(
	condition: ConditionConfig | Omit<ConditionRule, "type">,
	vars: Vars,
): boolean {
	if ("rules" in condition) {
		return condition.type === "and"
			? condition.rules.every((rule) => evaluateCondition(rule, vars))
			: condition.rules.some((rule) => evaluateCondition(rule, vars));
	}
	return evaluateRule(condition, vars);
}

function evaluateRule(rule: Omit<ConditionRule, "type">, vars: Vars): boolean {
	const actual = vars[rule.field];
	const hasValue = actual != null && String(actual).trim() !== "";
	const actualStr = hasValue ? String(actual) : "";

	if (rule.operator === "exists") return hasValue;
	if (rule.operator === "not_exists" || rule.operator === "is_empty") {
		return !hasValue;
	}

	let expected: string;
	if (isVarRef(rule.value)) {
		const ref = vars[rule.value.var];
		if (ref == null || String(ref).trim() === "") return false;
		expected = String(ref);
	} else {
		expected = rule.value == null ? "" : String(rule.value);
	}

	switch (rule.operator) {
		case "eq":
			return normalize(actualStr) === normalize(expected);
		case "neq":
			return normalize(actualStr) !== normalize(expected);
		case "contains":
			return normalize(actualStr).includes(normalize(expected));
		case "starts_with":
			return normalize(actualStr).startsWith(normalize(expected));
		case "ends_with":
			return normalize(actualStr).endsWith(normalize(expected));
		case "gt":
			return hasValue && compareNumbers(actualStr, expected) > 0;
		case "gte":
			return (
				hasValue &&
				compareNumbers(actualStr, expected) >= 0 &&
				isNumeric(actualStr, expected)
			);
		case "lt":
			return hasValue && compareNumbers(actualStr, expected) < 0;
		case "lte":
			return (
				hasValue &&
				compareNumbers(actualStr, expected) <= 0 &&
				isNumeric(actualStr, expected)
			);
		default:
			return false;
	}
}

function isNumeric(left: string, right: string): boolean {
	return Number.isFinite(Number(left)) && Number.isFinite(Number(right));
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
