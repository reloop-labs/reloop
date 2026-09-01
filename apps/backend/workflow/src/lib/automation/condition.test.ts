import { describe, expect, test } from "bun:test";
import type { AutomationGraph } from "@reloop/db/schema";
import {
	evaluateCondition,
	getBranchTarget,
	parseConditionData,
} from "./condition";

describe("parseConditionData", () => {
	test("requires field, operator, and value", () => {
		expect(() => parseConditionData({})).toThrow("field");
		expect(() => parseConditionData({ field: "status" })).toThrow("operator");
		expect(() =>
			parseConditionData({ field: "status", operator: "eq" }),
		).toThrow("value");
	});

	test("allows empty value for exists", () => {
		expect(
			parseConditionData({ field: "firstName", operator: "exists" }),
		).toEqual({
			field: "firstName",
			operator: "exists",
			value: "",
		});
	});
});

describe("evaluateCondition", () => {
	const vars = {
		status: "subscribed",
		firstName: "Ada",
		"event.plan": "pro",
		"property.seats": "10",
	};

	test("equals is case-insensitive", () => {
		expect(
			evaluateCondition(
				{ field: "event.plan", operator: "eq", value: "PRO" },
				vars,
			),
		).toBe(true);
		expect(
			evaluateCondition(
				{ field: "event.plan", operator: "eq", value: "free" },
				vars,
			),
		).toBe(false);
	});

	test("exists / not_exists", () => {
		expect(
			evaluateCondition(
				{ field: "firstName", operator: "exists", value: "" },
				vars,
			),
		).toBe(true);
		expect(
			evaluateCondition(
				{ field: "lastName", operator: "not_exists", value: "" },
				vars,
			),
		).toBe(true);
	});

	test("numeric greater/less than", () => {
		expect(
			evaluateCondition(
				{ field: "property.seats", operator: "gt", value: "5" },
				vars,
			),
		).toBe(true);
		expect(
			evaluateCondition(
				{ field: "property.seats", operator: "lt", value: "5" },
				vars,
			),
		).toBe(false);
	});
});

describe("getBranchTarget", () => {
	const graph: AutomationGraph = {
		nodes: [],
		edges: [
			{
				id: "e-yes",
				source: "cond",
				target: "send-yes",
				sourceHandle: "yes",
			},
			{
				id: "e-no",
				source: "cond",
				target: "send-no",
				data: { branch: "no" },
			},
		],
	};

	test("resolves yes/no from handle or edge data", () => {
		expect(getBranchTarget(graph, "cond", "yes")).toBe("send-yes");
		expect(getBranchTarget(graph, "cond", "no")).toBe("send-no");
	});
});
