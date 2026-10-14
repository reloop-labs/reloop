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
			type: "rule",
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

describe("rules, groups and references", () => {
	const vars = {
		"event.plan": "pro",
		"event.amount": "120",
		"event.order_id": "ord_1",
		"wait.order_id": "ord_1",
		"contact.email": "ada@example.com",
	};

	test("parses and/or groups with nested rules", () => {
		expect(
			parseConditionData({
				type: "and",
				rules: [
					{ type: "rule", field: "event.plan", operator: "eq", value: "pro" },
					{ type: "rule", field: "event.amount", operator: "gte", value: 100 },
				],
			}),
		).toEqual({
			type: "and",
			rules: [
				{ type: "rule", field: "event.plan", operator: "eq", value: "pro" },
				{ type: "rule", field: "event.amount", operator: "gte", value: 100 },
			],
		});
		expect(() => parseConditionData({ type: "or", rules: [] })).toThrow(
			"at least one rule",
		);
	});

	test("and needs every rule, or needs one", () => {
		const pro = {
			type: "rule",
			field: "event.plan",
			operator: "eq",
			value: "pro",
		} as const;
		const big = {
			type: "rule",
			field: "event.amount",
			operator: "gte",
			value: 500,
		} as const;
		expect(evaluateCondition({ type: "and", rules: [pro, big] }, vars)).toBe(
			false,
		);
		expect(evaluateCondition({ type: "or", rules: [pro, big] }, vars)).toBe(
			true,
		);
	});

	test("gte / lte / starts_with / ends_with / is_empty", () => {
		const rule = (operator: string, value?: string | number) =>
			parseConditionData({ field: "event.amount", operator, value });
		expect(evaluateCondition(rule("gte", 120), vars)).toBe(true);
		expect(evaluateCondition(rule("lte", 119), vars)).toBe(false);
		expect(
			evaluateCondition(
				parseConditionData({
					field: "contact.email",
					operator: "ends_with",
					value: "@EXAMPLE.com",
				}),
				vars,
			),
		).toBe(true);
		expect(
			evaluateCondition(
				parseConditionData({
					field: "contact.email",
					operator: "starts_with",
					value: "bob",
				}),
				vars,
			),
		).toBe(false);
		expect(
			evaluateCondition(
				parseConditionData({ field: "event.coupon", operator: "is_empty" }),
				vars,
			),
		).toBe(true);
	});

	test("{ var } compares against another field; missing data never matches", () => {
		expect(
			evaluateCondition(
				parseConditionData({
					field: "wait.order_id",
					operator: "eq",
					value: { var: "event.order_id" },
				}),
				vars,
			),
		).toBe(true);
		expect(
			evaluateCondition(
				parseConditionData({
					field: "wait.order_id",
					operator: "neq",
					value: { var: "event.missing" },
				}),
				vars,
			),
		).toBe(false);
	});
});
