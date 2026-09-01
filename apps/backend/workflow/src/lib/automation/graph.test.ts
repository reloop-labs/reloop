import { describe, expect, test } from "bun:test";
import type { AutomationGraph } from "@reloop/db/schema";
import {
	extractTriggerEvent,
	getFirstActionNodeIds,
	validateAutomationGraph,
} from "./graph";

function graph(partial: Partial<AutomationGraph>): AutomationGraph {
	return {
		nodes: partial.nodes ?? [],
		edges: partial.edges ?? [],
	};
}

const trigger = {
	id: "trigger",
	type: "trigger",
	position: { x: 0, y: 0 },
	data: { eventKey: "user.signed_up" },
};

const send = {
	id: "send-1",
	type: "send_email",
	position: { x: 0, y: 120 },
	data: {
		to: "{{contact.email}}",
		from: "hello@example.com",
		subject: "Welcome",
	},
};

describe("validateAutomationGraph", () => {
	test("accepts a linear signup drip", () => {
		const result = validateAutomationGraph(
			graph({
				nodes: [trigger, send],
				edges: [{ id: "e1", source: "trigger", target: "send-1" }],
			}),
		);
		expect(result.isValid).toBe(true);
		expect(result.triggerEvent).toBe("user.signed_up");
	});

	test("requires a custom event on the trigger", () => {
		const result = validateAutomationGraph(
			graph({
				nodes: [{ ...trigger, data: {} }, send],
				edges: [{ id: "e1", source: "trigger", target: "send-1" }],
			}),
		);
		expect(result.isValid).toBe(false);
		expect(result.errors.some((e) => e.includes("custom event"))).toBe(true);
	});

	test("requires From on send email steps", () => {
		const result = validateAutomationGraph(
			graph({
				nodes: [
					trigger,
					{
						...send,
						data: { to: "{{contact.email}}", subject: "Welcome" },
					},
				],
				edges: [{ id: "e1", source: "trigger", target: "send-1" }],
			}),
		);
		expect(result.isValid).toBe(false);
		expect(result.errors.some((e) => e.includes("From"))).toBe(true);
	});
});

describe("getFirstActionNodeIds", () => {
	test("follows edges from the trigger even if its id is not 'trigger'", () => {
		const result = getFirstActionNodeIds(
			graph({
				nodes: [{ ...trigger, id: "start" }, send],
				edges: [{ id: "e1", source: "start", target: "send-1" }],
			}),
		);
		expect(result).toEqual(["send-1"]);
	});
});

describe("validateAutomationGraph conditions", () => {
	test("accepts a condition with a Yes path", () => {
		const result = validateAutomationGraph(
			graph({
				nodes: [
					trigger,
					{
						id: "cond",
						type: "condition",
						position: { x: 0, y: 80 },
						data: { field: "event.plan", operator: "eq", value: "pro" },
					},
					send,
				],
				edges: [
					{ id: "e0", source: "trigger", target: "cond" },
					{
						id: "e1",
						source: "cond",
						target: "send-1",
						sourceHandle: "yes",
					},
				],
			}),
		);
		expect(result.isValid).toBe(true);
	});

	test("rejects a condition with no branches", () => {
		const result = validateAutomationGraph(
			graph({
				nodes: [
					trigger,
					{
						id: "cond",
						type: "condition",
						position: { x: 0, y: 80 },
						data: { field: "status", operator: "eq", value: "subscribed" },
					},
				],
				edges: [{ id: "e0", source: "trigger", target: "cond" }],
			}),
		);
		expect(result.isValid).toBe(false);
		expect(result.errors.some((e) => e.includes("Yes or No"))).toBe(true);
	});
});

describe("extractTriggerEvent", () => {
	test("prefers eventKey over eventId", () => {
		expect(
			extractTriggerEvent(
				graph({
					nodes: [
						{
							...trigger,
							data: { eventKey: "user.signed_up", eventId: "evt_old" },
						},
					],
				}),
			),
		).toBe("user.signed_up");
	});
});
