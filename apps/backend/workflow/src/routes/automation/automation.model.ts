import { t } from "elysia";

const graphNode = t.Object({
	id: t.String(),
	type: t.String(),
	position: t.Object({
		x: t.Number(),
		y: t.Number(),
	}),
	data: t.Record(t.String(), t.Unknown()),
});

const graphEdge = t.Object({
	id: t.String(),
	source: t.String(),
	target: t.String(),
	sourceHandle: t.Optional(t.Union([t.String(), t.Null()])),
	targetHandle: t.Optional(t.Union([t.String(), t.Null()])),
	type: t.Optional(t.String()),
	data: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const automationGraphSchema = t.Object({
	nodes: t.Array(graphNode),
	edges: t.Array(graphEdge),
});

// Public steps + connections shape (see lib/automation/steps.ts). Configs are
// checked there so every problem comes back in one readable error.
const stepInput = t.Object({
	key: t.String({
		description:
			"Unique key for this step, used by connections (1-64 letters, numbers, _ or -).",
	}),
	type: t.String({
		description: '"trigger", "send_email", "delay" or "condition".',
	}),
	config: t.Optional(
		t.Record(t.String(), t.Unknown(), {
			description:
				'trigger: { eventName }. send_email: { template: { id }, from?, subject? }. delay: { amount, unit }. condition: { type: "rule", field, operator, value } or { type: "and" | "or", rules }.',
		}),
	),
});

const connectionInput = t.Object({
	from: t.String({ description: "Key of the step this connection leaves." }),
	to: t.String({ description: "Key of the step it leads to." }),
	type: t.Optional(
		t.String({
			description:
				'"default" (the default), or "condition_met" / "condition_not_met" from a condition step.',
		}),
	),
});

const stepResponse = t.Object({
	key: t.String(),
	type: t.String(),
	config: t.Record(t.String(), t.Unknown()),
});

const connectionResponse = t.Object({
	from: t.String(),
	to: t.String(),
	type: t.Union([
		t.Literal("default"),
		t.Literal("condition_met"),
		t.Literal("condition_not_met"),
	]),
});

export namespace AutomationModel {
	export const automationIdParam = t.String({
		minLength: 1,
		description: "Automation ID",
	});

	export const createBody = t.Object({
		name: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Automation name",
		}),
		description: t.Optional(
			t.String({
				maxLength: 2000,
				description: "Optional description",
			}),
		),
		status: t.Optional(
			t.Union([t.Literal("draft"), t.Literal("active")], {
				description:
					'"draft" (default) or "active" to validate and start it right away.',
			}),
		),
		steps: t.Optional(t.Array(stepInput, { maxItems: 200 })),
		connections: t.Optional(t.Array(connectionInput, { maxItems: 400 })),
	});

	export const updateBody = t.Object({
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
			}),
		),
		description: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
		/** Dashboard canvas graph. API clients send `steps` + `connections`. */
		graph: t.Optional(automationGraphSchema),
		steps: t.Optional(
			t.Array(stepInput, {
				maxItems: 200,
				description: "Replaces all steps (send `connections` with it).",
			}),
		),
		connections: t.Optional(t.Array(connectionInput, { maxItems: 400 })),
		status: t.Optional(
			t.Union([t.Literal("active"), t.Literal("paused")], {
				description: '"active" validates and starts it; "paused" stops it.',
			}),
		),
	});

	export const listQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 50 })),
	});

	export const automationResponse = t.Object({
		id: t.String(),
		organizationId: t.String(),
		name: t.String(),
		description: t.Nullable(t.String()),
		status: t.Union([
			t.Literal("draft"),
			t.Literal("active"),
			t.Literal("paused"),
		]),
		triggerEvent: t.Nullable(t.String()),
		steps: t.Array(stepResponse),
		connections: t.Array(connectionResponse),
		graph: automationGraphSchema,
		activeVersionId: t.Nullable(t.String()),
		createdAt: t.String(),
		updatedAt: t.String(),
	});

	export const automationListResponse = t.Object({
		automations: t.Array(automationResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export const evlogError = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});

	export const deleteResponse = t.Object({
		success: t.Boolean(),
		id: t.String(),
	});

	export const enrollBody = t.Object({
		contactId: t.Optional(t.String()),
		email: t.Optional(t.String({ format: "email" })),
		firstName: t.Optional(t.String({ maxLength: 255 })),
		lastName: t.Optional(t.String({ maxLength: 255 })),
	});

	export const enrollmentStatus = t.Union([
		t.Literal("active"),
		t.Literal("completed"),
		t.Literal("cancelled"),
		t.Literal("failed"),
	]);

	export const stepRunStatus = t.Union([
		t.Literal("pending"),
		t.Literal("running"),
		t.Literal("completed"),
		t.Literal("skipped"),
		t.Literal("failed"),
	]);

	export const enrollmentResponse = t.Object({
		id: t.String(),
		automationId: t.String(),
		contactId: t.String(),
		contactEmail: t.Nullable(t.String()),
		contactFirstName: t.Nullable(t.String()),
		contactLastName: t.Nullable(t.String()),
		status: enrollmentStatus,
		currentNodeId: t.Nullable(t.String()),
		enrolledAt: t.String(),
		completedAt: t.Nullable(t.String()),
		cancelledAt: t.Nullable(t.String()),
	});

	export const enrollResponse = t.Object({
		enrollment: enrollmentResponse,
		contactCreated: t.Boolean(),
		delayMs: t.Number(),
	});

	export const enrollmentListQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 50 })),
		status: t.Optional(enrollmentStatus),
	});

	export const enrollmentListResponse = t.Object({
		enrollments: t.Array(enrollmentResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export const stepRunResponse = t.Object({
		id: t.String(),
		nodeId: t.String(),
		nodeType: t.String(),
		status: stepRunStatus,
		scheduledFor: t.String(),
		startedAt: t.Nullable(t.String()),
		finishedAt: t.Nullable(t.String()),
		emailLogId: t.Nullable(t.String()),
		error: t.Nullable(t.String()),
	});

	export const enrollmentDetailResponse = t.Object({
		enrollment: enrollmentResponse,
		steps: t.Array(stepRunResponse),
	});
}
