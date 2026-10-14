import { describe, expect, test } from "bun:test";
import { graphToSteps, stepsToGraph } from "./steps";

const welcome = {
	steps: [
		{ key: "start", type: "trigger", config: { eventName: "user.created" } },
		{
			key: "check_plan",
			type: "condition",
			config: {
				type: "rule",
				field: "event.plan",
				operator: "eq",
				value: "pro",
			},
		},
		{ key: "pro", type: "send_email", config: { template: { id: "tpl_pro" } } },
		{ key: "wait", type: "delay", config: { amount: 1, unit: "days" } },
		{
			key: "free",
			type: "send_email",
			config: { template: { id: "tpl_free" } },
		},
	],
	connections: [
		{ from: "start", to: "check_plan", type: "default" },
		{ from: "check_plan", to: "pro", type: "condition_met" },
		{ from: "check_plan", to: "wait", type: "condition_not_met" },
		{ from: "wait", to: "free" },
	],
};

describe("stepsToGraph", () => {
	test("builds the stored graph the dashboard and engine use", () => {
		const result = stepsToGraph(welcome.steps, welcome.connections);
		if (!result.ok) throw new Error(result.errors.join("\n"));
		const { nodes, edges } = result.graph;

		// The trigger always lives under the fixed "trigger" id, and event keys
		// get the "trigger." prefix every stored key has.
		expect(nodes.find((n) => n.type === "trigger")).toMatchObject({
			id: "trigger",
			data: { eventKey: "trigger.user.created", key: "start" },
		});
		// A single rule is stored flat, like the dashboard writes it.
		expect(nodes.find((n) => n.id === "check_plan")?.data).toEqual({
			field: "event.plan",
			operator: "eq",
			value: "pro",
		});
		expect(nodes.find((n) => n.id === "pro")?.data).toEqual({
			templateId: "tpl_pro",
		});
		expect(edges.map((e) => [e.source, e.target, e.sourceHandle])).toEqual([
			["trigger", "check_plan", undefined],
			["check_plan", "pro", "yes"],
			["check_plan", "wait", "no"],
			["wait", "free", undefined],
		]);
	});

	test("round-trips through graphToSteps", () => {
		const result = stepsToGraph(welcome.steps, welcome.connections);
		if (!result.ok) throw new Error(result.errors.join("\n"));
		const back = graphToSteps(result.graph);
		expect(back.steps.map((s) => s.key)).toEqual([
			"start",
			"check_plan",
			"pro",
			"wait",
			"free",
		]);
		expect(back.steps[1]).toEqual(welcome.steps[1] as never);
		expect(back.connections).toEqual([
			{ from: "start", to: "check_plan", type: "default" },
			{ from: "check_plan", to: "pro", type: "condition_met" },
			{ from: "check_plan", to: "wait", type: "condition_not_met" },
			{ from: "wait", to: "free", type: "default" },
		]);
	});

	test("accepts event_name and and/or conditions", () => {
		const result = stepsToGraph(
			[
				{ key: "start", type: "trigger", config: { event_name: "order.paid" } },
				{
					key: "big",
					type: "condition",
					config: {
						type: "or",
						rules: [
							{
								type: "rule",
								field: "event.amount",
								operator: "gte",
								value: 100,
							},
							{
								type: "rule",
								field: "contact.plan",
								operator: "eq",
								value: "pro",
							},
						],
					},
				},
			],
			[{ from: "start", to: "big" }],
		);
		if (!result.ok) throw new Error(result.errors.join("\n"));
		expect(result.graph.nodes[0]?.data.eventKey).toBe("trigger.order.paid");
		expect(result.graph.nodes[1]?.data).toMatchObject({ type: "or" });
	});

	test("reports every problem at once", () => {
		const result = stepsToGraph(
			[
				{ key: "start", type: "trigger", config: {} },
				{ key: "start", type: "delay", config: { amount: 1, unit: "days" } },
				{
					key: "check",
					type: "condition",
					config: { field: "event.plan", operator: "eq" },
				},
				{ key: "mail", type: "send_email", config: {} },
				{ key: "x", type: "sms" },
			],
			[
				{ from: "start", to: "check" },
				{ from: "check", to: "mail", type: "default" },
				{ from: "start", to: "nope" },
			],
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		const all = result.errors.join("\n");
		expect(all).toContain("config.eventName is required");
		expect(all).toContain('"start" is used more than once');
		expect(all).toContain("needs a value");
		expect(all).toContain("config.template.id is required");
		expect(all).toContain("type must be one of");
		expect(all).toContain('need type "condition_met" or "condition_not_met"');
		expect(all).toContain('no step with key "nope"');
	});

	test("rejects shapes the dashboard can't draw", () => {
		const steps = [
			{ key: "start", type: "trigger", config: { eventName: "e" } },
			{ key: "a", type: "delay", config: { amount: 1, unit: "hours" } },
			{ key: "b", type: "delay", config: { amount: 1, unit: "hours" } },
		];
		const twoNext = stepsToGraph(steps, [
			{ from: "start", to: "a" },
			{ from: "start", to: "b" },
		]);
		expect(twoNext.ok ? [] : twoNext.errors).toContain(
			'Step "start" has more than one next step.',
		);
		const loop = stepsToGraph(steps, [
			{ from: "start", to: "a" },
			{ from: "a", to: "b" },
			{ from: "b", to: "a" },
		]);
		expect(loop.ok).toBe(false);
		const noTrigger = stepsToGraph(steps.slice(1), []);
		expect(noTrigger.ok ? [] : noTrigger.errors).toContain(
			'Add exactly one step with type "trigger".',
		);
	});
});
