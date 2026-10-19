import { describe, expect, test } from "bun:test";
import type {
	Automation,
	Enrollment,
	WorkflowEvent,
} from "../src/reloop/types";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	errorJson,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

const AUTOMATIONS = "/api/workflow/v1/automations";
const EVENTS = "/api/workflow/v1/events";

const steps = [
	{ key: "start", type: "trigger", config: { eventName: "user.signed_up" } },
	{
		key: "is_pro",
		type: "condition",
		config: {
			type: "rule",
			field: "trigger.plan",
			operator: "eq",
			value: "pro",
		},
	},
	{
		key: "welcome",
		type: "send_email",
		config: { template: { id: "tmpl_1" } },
	},
	{ key: "wait", type: "delay", config: { amount: 1, unit: "days" } },
];

function automationFixture(over: Partial<Automation> = {}): Automation {
	return {
		id: "auto_1",
		organizationId: "org_1",
		name: "Welcome",
		description: null,
		status: "draft",
		triggerEvent: "trigger.user.signed_up",
		steps,
		connections: [
			{ from: "start", to: "is_pro", type: "default" },
			{ from: "is_pro", to: "welcome", type: "condition_met" },
			{ from: "is_pro", to: "wait", type: "condition_not_met" },
		],
		activeVersionId: null,
		reentry: "once",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		...over,
	};
}

function enrollmentFixture(over: Partial<Enrollment> = {}): Enrollment {
	return {
		id: "enr_1",
		automationId: "auto_1",
		contactId: "con_1",
		contactEmail: "luna@example.com",
		contactFirstName: "Luna",
		contactLastName: null,
		status: "active",
		currentNodeId: "wait",
		enrolledAt: "2026-01-01T00:00:00.000Z",
		completedAt: null,
		cancelledAt: null,
		replacedByEnrollmentId: null,
		...over,
	};
}

function eventFixture(over: Partial<WorkflowEvent> = {}): WorkflowEvent {
	return {
		id: "evt_1",
		organizationId: "org_1",
		name: "User signed up",
		key: "trigger.user.signed_up",
		description: null,
		properties: [
			{
				id: "evtp_1",
				name: "plan",
				propertyType: "string",
				required: true,
				defaultValue: null,
				description: null,
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-01T00:00:00.000Z",
			},
		],
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		...over,
	};
}

function onlyCall(calls: RecordedCall[]): RecordedCall {
	expect(calls).toHaveLength(1);
	const call = calls[0];
	if (call === undefined) {
		throw new Error("expected one upstream call");
	}
	return call;
}

async function call(routes: Route[], name: string, args: object) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("automations", () => {
	test("create_automation always creates a draft and fills connection types", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: AUTOMATIONS,
					status: 201,
					body: automationFixture(),
				},
			],
			"create_automation",
			{
				name: "Welcome",
				steps,
				connections: [
					{ from: "start", to: "is_pro" },
					{ from: "is_pro", to: "welcome", type: "condition_met" },
					{ from: "is_pro", to: "wait", type: "condition_not_met" },
				],
			},
		);
		const body = onlyCall(calls).body;
		expect(readProperty(body, "status")).toBe("draft");
		expect(readProperty(body, "steps")).toEqual(steps);
		expect(readProperty(body, "connections")).toEqual([
			{ from: "start", to: "is_pro", type: "default" },
			{ from: "is_pro", to: "welcome", type: "condition_met" },
			{ from: "is_pro", to: "wait", type: "condition_not_met" },
		]);
		const automation = readProperty(structuredContent(result), "automation");
		expect(readProperty(automation, "id")).toBe("auto_1");
		expect(readProperty(automation, "organizationId")).toBeUndefined();
	});

	test("create_automation rejects an unknown step type before calling Reloop", async () => {
		const { calls, result } = await call([], "create_automation", {
			name: "Welcome",
			steps: [{ key: "a", type: "sms", config: {} }],
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("create_automation surfaces every step problem from the API", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: AUTOMATIONS,
					status: 400,
					body: {
						message: "Invalid workflow graph",
						why: 'Step "welcome": config.template.id is required.',
						fix: "Fix the validation issues and try again.",
					},
				},
			],
			"create_automation",
			{ name: "Welcome", steps },
		);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("invalid_automation");
		expect(String(readProperty(error, "why"))).toContain("welcome");
	});

	test("update_automation sends steps with connections and refuses connections alone", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: `${AUTOMATIONS}/auto_1`,
					body: automationFixture(),
				},
			],
			"update_automation",
			{ id: "auto_1", steps },
		);
		expect(onlyCall(calls).body).toEqual({ steps, connections: [] });

		const refused = await call([], "update_automation", {
			id: "auto_1",
			connections: [{ from: "start", to: "wait" }],
		});
		expect(readProperty(refused.result, "isError")).toBe(true);
		expect(refused.calls).toHaveLength(0);
	});

	test("activate_automation and pause_automation post to their actions", async () => {
		const activated = await call(
			[
				{
					method: "POST",
					path: `${AUTOMATIONS}/auto_1/activate`,
					body: automationFixture({
						status: "active",
						activeVersionId: "autov_1",
					}),
				},
			],
			"activate_automation",
			{ id: "auto_1" },
		);
		const automation = readProperty(
			structuredContent(activated.result),
			"automation",
		);
		expect(readProperty(automation, "status")).toBe("active");

		const paused = await call(
			[
				{
					method: "POST",
					path: `${AUTOMATIONS}/auto_1/pause`,
					body: automationFixture({ status: "paused" }),
				},
			],
			"pause_automation",
			{ id: "auto_1" },
		);
		expect(onlyCall(paused.calls).method).toBe("POST");
	});

	test("list_automations reports pagination", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: AUTOMATIONS,
					body: {
						automations: [automationFixture()],
						total: 30,
						page: 1,
						limit: 20,
					},
				},
			],
			"list_automations",
			{},
		);
		expect(onlyCall(calls).query).toEqual({ page: "1", limit: "20" });
		const pagination = readProperty(structuredContent(result), "pagination");
		expect(readProperty(pagination, "hasMore")).toBe(true);
	});

	test("delete_automation", async () => {
		const { result } = await call(
			[
				{
					method: "DELETE",
					path: `${AUTOMATIONS}/auto_1`,
					body: { success: true, id: "auto_1" },
				},
			],
			"delete_automation",
			{ id: "auto_1" },
		);
		expect(structuredContent(result)).toEqual({ deleted: true, id: "auto_1" });
	});
});

describe("enrollments", () => {
	test("enroll_contact needs contactId or email", async () => {
		const { calls, result } = await call([], "enroll_contact", {
			automationId: "auto_1",
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("enroll_contact maps the delay to seconds", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: `${AUTOMATIONS}/auto_1/enroll`,
					body: {
						enrollment: enrollmentFixture({ currentNodeId: "start" }),
						contactCreated: true,
						delayMs: 90000,
					},
				},
			],
			"enroll_contact",
			{ automationId: "auto_1", email: "luna@example.com", firstName: "Luna" },
		);
		expect(onlyCall(calls).body).toEqual({
			email: "luna@example.com",
			firstName: "Luna",
		});
		const content = structuredContent(result);
		expect(readProperty(content, "firstStepInSeconds")).toBe(90);
		expect(readProperty(content, "contactCreated")).toBe(true);
		expect(
			readProperty(readProperty(content, "enrollment"), "currentStep"),
		).toBe("start");
	});

	test("enroll_contact reports already_enrolled", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: `${AUTOMATIONS}/auto_1/enroll`,
					status: 409,
					body: { message: "Contact already enrolled" },
				},
			],
			"enroll_contact",
			{ automationId: "auto_1", contactId: "con_1" },
		);
		expect(readProperty(errorJson(result), "code")).toBe("already_enrolled");
	});

	test("list_enrollments forwards the status filter", async () => {
		const { calls } = await call(
			[
				{
					method: "GET",
					path: `${AUTOMATIONS}/auto_1/enrollments`,
					body: {
						enrollments: [enrollmentFixture()],
						total: 1,
						page: 1,
						limit: 20,
					},
				},
			],
			"list_enrollments",
			{ automationId: "auto_1", status: "failed" },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "20",
			status: "failed",
		});
	});

	test("get_enrollment explains each step", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: `${AUTOMATIONS}/auto_1/enrollments/enr_1`,
					body: {
						enrollment: enrollmentFixture({ status: "cancelled" }),
						steps: [
							{
								id: "astep_1",
								nodeId: "welcome",
								nodeType: "send_email",
								status: "skipped",
								scheduledFor: "2026-01-01T00:00:00.000Z",
								startedAt: null,
								finishedAt: null,
								emailLogId: null,
								error: "Contact not sendable",
							},
						],
					},
				},
			],
			"get_enrollment",
			{ automationId: "auto_1", enrollmentId: "enr_1" },
		);
		const stepsOut = readProperty(structuredContent(result), "steps");
		expect(stepsOut).toEqual([
			{
				id: "astep_1",
				step: "welcome",
				stepType: "send_email",
				status: "skipped",
				scheduledFor: "2026-01-01T00:00:00.000Z",
				startedAt: null,
				finishedAt: null,
				emailId: null,
				error: "Contact not sendable",
			},
		]);
	});
});

describe("events", () => {
	test("create_event sends properties with defaults", async () => {
		const { calls, result } = await call(
			[{ method: "POST", path: EVENTS, status: 201, body: eventFixture() }],
			"create_event",
			{
				name: "User signed up",
				key: "user.signed_up",
				properties: [{ name: "plan" }],
			},
		);
		expect(onlyCall(calls).body).toEqual({
			name: "User signed up",
			key: "user.signed_up",
			properties: [{ name: "plan", propertyType: "string", required: false }],
		});
		const event = readProperty(structuredContent(result), "event");
		expect(readProperty(event, "key")).toBe("trigger.user.signed_up");
	});

	test("get_event looks up by key", async () => {
		const { calls } = await call(
			[
				{
					method: "GET",
					path: `${EVENTS}/user.signed_up`,
					body: eventFixture(),
				},
			],
			"get_event",
			{ idOrKey: "user.signed_up" },
		);
		expect(onlyCall(calls).path).toBe(`${EVENTS}/user.signed_up`);
	});

	test("event_already_exists on duplicate keys", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: EVENTS,
					status: 409,
					body: { message: "Event key already exists" },
				},
			],
			"create_event",
			{ name: "User signed up" },
		);
		expect(readProperty(errorJson(result), "code")).toBe(
			"event_already_exists",
		);
	});

	test("track_event forwards the contact and properties", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: `${EVENTS}/track`,
					body: {
						success: true,
						eventId: "evt_1",
						eventKey: "trigger.user.signed_up",
						contactId: "con_1",
						contactCreated: false,
						enrollments: 2,
						properties: { plan: "pro" },
					},
				},
			],
			"track_event",
			{
				event: "user.signed_up",
				email: "luna@example.com",
				properties: { plan: "pro" },
			},
		);
		expect(onlyCall(calls).body).toEqual({
			event: "user.signed_up",
			email: "luna@example.com",
			properties: { plan: "pro" },
		});
		expect(readProperty(structuredContent(result), "enrollments")).toBe(2);
	});

	test("track_event needs a contact", async () => {
		const { calls, result } = await call([], "track_event", {
			event: "user.signed_up",
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("update_event and delete_event use the event ID", async () => {
		const updated = await call(
			[
				{
					method: "PATCH",
					path: `${EVENTS}/evt_1`,
					body: eventFixture({ description: "New" }),
				},
			],
			"update_event",
			{ id: "evt_1", description: "New" },
		);
		expect(onlyCall(updated.calls).body).toEqual({ description: "New" });

		const deleted = await call(
			[
				{
					method: "DELETE",
					path: `${EVENTS}/evt_1`,
					body: { success: true, id: "evt_1" },
				},
			],
			"delete_event",
			{ id: "evt_1" },
		);
		expect(structuredContent(deleted.result)).toEqual({
			deleted: true,
			id: "evt_1",
		});
	});
});
