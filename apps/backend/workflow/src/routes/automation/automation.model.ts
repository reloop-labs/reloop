import { t } from "elysia";

// Examples shown in the API reference.
const exampleSteps = [
	{
		key: "start",
		type: "trigger",
		config: { eventName: "trigger.user.signed_up" },
	},
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
		key: "welcome_pro",
		type: "send_email",
		config: { template: { id: "tmpl_123456789" } },
	},
	{ key: "wait", type: "delay", config: { amount: 1, unit: "days" } },
	{
		key: "welcome_free",
		type: "send_email",
		config: { template: { id: "tmpl_987654321" } },
	},
];

const exampleConnections = [
	{ from: "start", to: "is_pro", type: "default" },
	{ from: "is_pro", to: "welcome_pro", type: "condition_met" },
	{ from: "is_pro", to: "wait", type: "condition_not_met" },
	{ from: "wait", to: "welcome_free", type: "default" },
];

const exampleAutomation = {
	id: "auto_123456789",
	organizationId: "org_123456789",
	name: "Welcome",
	description: "Greets new sign-ups",
	status: "active",
	triggerEvent: "trigger.user.signed_up",
	steps: exampleSteps,
	connections: exampleConnections,
	graph: { nodes: [], edges: [] },
	activeVersionId: "autov_123456789",
	createdAt: "2026-03-23T10:00:00.000Z",
	updatedAt: "2026-03-23T10:00:00.000Z",
};

const exampleEnrollment = {
	id: "enr_123456789",
	automationId: "auto_123456789",
	contactId: "con_123456789",
	contactEmail: "john.doe@example.com",
	contactFirstName: "John",
	contactLastName: "Doe",
	status: "active",
	currentNodeId: "wait",
	enrolledAt: "2026-03-23T10:00:00.000Z",
	completedAt: null,
	cancelledAt: null,
	endedAt: null,
};

const errorFields = {
	message: t.String(),
	why: t.Optional(t.String()),
	fix: t.Optional(t.String()),
	link: t.Optional(t.String()),
};

const errorExample = (message: string, why?: string, fix?: string) =>
	t.Object(errorFields, {
		examples: [why ? { message, why, fix } : { message }],
	});

export const workflowErrorExample = errorExample;

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
		description: "Automation ID (auto_...)",
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
		steps: t.Optional(
			t.Array(stepInput, {
				maxItems: 200,
				description:
					"The steps, with exactly one trigger. Can be left out to create an empty draft.",
			}),
		),
		connections: t.Optional(
			t.Array(connectionInput, {
				maxItems: 400,
				description: "How the steps link together, by step key.",
			}),
		),
	});

	export const updateBody = t.Object({
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
				description: "Automation name",
			}),
		),
		description: t.Optional(
			t.Union([t.String({ maxLength: 2000 }), t.Null()], {
				description: "Description, or null to clear it",
			}),
		),
		/** Dashboard canvas graph. API clients send `steps` + `connections`. */
		graph: t.Optional(
			t.Object(automationGraphSchema.properties, {
				description:
					"Used by the dashboard editor. Send steps and connections instead.",
			}),
		),
		steps: t.Optional(
			t.Array(stepInput, {
				maxItems: 200,
				description: "Replaces all steps (send `connections` with it).",
			}),
		),
		connections: t.Optional(
			t.Array(connectionInput, {
				maxItems: 400,
				description: "Replaces all connections (send `steps` with it).",
			}),
		),
		status: t.Optional(
			t.Union([t.Literal("active"), t.Literal("paused")], {
				description: '"active" validates and starts it; "paused" stops it.',
			}),
		),
	});

	export const listQuery = t.Object({
		page: t.Optional(
			t.Numeric({ minimum: 1, default: 1, description: "Page number" }),
		),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				default: 50,
				description: "Automations per page",
			}),
		),
	});

	export const automationResponse = t.Object(
		{
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
		},
		{ examples: [exampleAutomation] },
	);

	export const automationListResponse = t.Object(
		{
			automations: t.Array(automationResponse),
			total: t.Number(),
			page: t.Number(),
			limit: t.Number(),
		},
		{
			examples: [
				{ automations: [exampleAutomation], total: 1, page: 1, limit: 50 },
			],
		},
	);

	export const evlogError = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});

	export const deleteResponse = t.Object(
		{
			success: t.Boolean(),
			id: t.String(),
		},
		{ examples: [{ success: true, id: "auto_123456789" }] },
	);

	export const errors = {
		unauthorized: errorExample("Authentication required"),
		notFound: errorExample(
			"Automation not found",
			'No automation with ID "auto_123456789" exists for your organization.',
			"Verify the ID and ensure it belongs to your active organization.",
		),
		invalidGraph: errorExample(
			"Invalid workflow graph",
			'Step "is_pro": config.operator is required. Step "welcome_pro": config.template.id is required.',
			"Fix the validation issues and try again.",
		),
		cannotActivate: errorExample(
			"Cannot activate automation",
			'Custom event "trigger.user.signed_up" was not found. Create it under Events first.',
			"Complete the workflow configuration before activating.",
		),
		cannotEnroll: errorExample(
			"Automation is not active",
			"Only an active automation can enroll contacts.",
			"Activate the workflow, then enroll the contact.",
		),
		contactNotFound: errorExample(
			"Contact not found",
			"No matching contact was found for this organization.",
			"Create the contact first or pass a valid contactId/email.",
		),
		alreadyEnrolled: errorExample(
			"Contact already enrolled",
			"This contact is already enrolled (enr_123456789). Automations enroll a contact once.",
			"Pick a different contact, or inspect the existing enrollment.",
		),
		enrollmentNotFound: errorExample(
			"Enrollment not found",
			'No enrollment with ID "enr_123456789" exists for this automation.',
			"Verify the enrollment ID.",
		),
		internal: errorExample(
			"Failed to update automation",
			'An unexpected error occurred while updating automation "auto_123456789".',
			"Please try again later or contact support.",
		),
	};

	export const enrollBody = t.Object({
		contactId: t.Optional(
			t.String({ description: "Contact to enroll. Pass this or email." }),
		),
		email: t.Optional(
			t.String({
				format: "email",
				description:
					"Contact email. Creates the contact if it does not exist yet.",
			}),
		),
		firstName: t.Optional(
			t.String({
				maxLength: 255,
				description: "Used when the contact is created from email",
			}),
		),
		lastName: t.Optional(
			t.String({
				maxLength: 255,
				description: "Used when the contact is created from email",
			}),
		),
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
		endedAt: t.Nullable(
			t.String({
				description: "When it completed, was cancelled or failed",
			}),
		),
	});

	export const enrollResponse = t.Object(
		{
			enrollment: enrollmentResponse,
			contactCreated: t.Boolean(),
			delayMs: t.Number(),
		},
		{
			examples: [
				{
					enrollment: { ...exampleEnrollment, currentNodeId: "start" },
					contactCreated: false,
					delayMs: 0,
				},
			],
		},
	);

	export const enrollmentListQuery = t.Object({
		page: t.Optional(
			t.Numeric({ minimum: 1, default: 1, description: "Page number" }),
		),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				default: 50,
				description: "Enrollments per page",
			}),
		),
		status: t.Optional(
			t.Union(enrollmentStatus.anyOf, {
				description: "Only enrollments with this status",
			}),
		),
		since: t.Optional(
			t.String({
				format: "date-time",
				description: "Only enrollments that started at or after this time",
			}),
		),
	});

	export const enrollmentListResponse = t.Object(
		{
			enrollments: t.Array(enrollmentResponse),
			total: t.Number(),
			page: t.Number(),
			limit: t.Number(),
		},
		{
			examples: [
				{ enrollments: [exampleEnrollment], total: 1, page: 1, limit: 50 },
			],
		},
	);

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
		createdAt: t.String({
			description: "When the step was scheduled (a delay starts waiting here)",
		}),
	});

	export const stepEmailResponse = t.Object({
		from: t.Nullable(t.String()),
		to: t.String(),
		subject: t.String(),
		templateId: t.Nullable(t.String()),
		templateName: t.Nullable(t.String()),
		html: t.Nullable(t.String()),
		sent: t.Boolean({
			description: "True once it went out; the fields are then what was sent",
		}),
		emailId: t.Nullable(t.String()),
		deliveryStatus: t.Nullable(t.String()),
		problem: t.Nullable(
			t.String({ description: "Why it can't be sent as configured" }),
		),
	});

	export const enrollmentDetailResponse = t.Object(
		{
			enrollment: enrollmentResponse,
			trigger: t.Object(
				{
					eventKey: t.Nullable(t.String()),
					properties: t.Record(t.String(), t.Unknown()),
				},
				{
					description:
						"The event that started it; eventKey is null when the contact was enrolled directly",
				},
			),
			graph: t.Object(automationGraphSchema.properties, {
				description: "The published version of the steps this run follows",
			}),
			emails: t.Record(t.String(), stepEmailResponse, {
				description:
					"For each send_email step (by step ID): the email it sends this contact, or sent",
			}),
			steps: t.Array(stepRunResponse),
		},
		{
			examples: [
				{
					enrollment: exampleEnrollment,
					trigger: {
						eventKey: "trigger.user.signed_up",
						properties: { plan: "pro" },
					},
					graph: { nodes: [], edges: [] },
					emails: {},
					steps: [
						{
							id: "astep_123456789",
							nodeId: "is_pro",
							nodeType: "condition",
							status: "completed",
							scheduledFor: "2026-03-23T10:00:00.000Z",
							startedAt: "2026-03-23T10:00:00.000Z",
							finishedAt: "2026-03-23T10:00:00.000Z",
							emailLogId: null,
							error: null,
							createdAt: "2026-03-23T10:00:00.000Z",
						},
						{
							id: "astep_987654321",
							nodeId: "wait",
							nodeType: "delay",
							status: "pending",
							scheduledFor: "2026-03-24T10:00:00.000Z",
							startedAt: null,
							finishedAt: null,
							emailLogId: null,
							error: null,
							createdAt: "2026-03-23T10:00:00.000Z",
						},
					],
				},
			],
		},
	);

	export const metricsQuery = t.Object({
		days: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 90,
				default: 30,
				description: "How many days the daily breakdown covers",
			}),
		),
	});

	const runCounts = {
		total: t.Number(),
		active: t.Number(),
		completed: t.Number(),
		cancelled: t.Number(),
		failed: t.Number(),
	};

	const emailCounts = {
		sent: t.Number(),
		delivered: t.Number(),
		opened: t.Number(),
		clicked: t.Number(),
		bounced: t.Number(),
	};

	export const metricsResponse = t.Object(
		{
			runs: t.Object({
				...runCounts,
				averageDurationMs: t.Nullable(
					t.Number({ description: "Average time to complete a run" }),
				),
			}),
			emails: t.Object({
				sent: t.Number(),
				delivered: t.Number(),
				opened: t.Number(),
				clicked: t.Number(),
				bounced: t.Number(),
			}),
			steps: t.Array(
				t.Object({
					nodeId: t.String(),
					nodeType: t.String(),
					pending: t.Number(),
					running: t.Number(),
					completed: t.Number(),
					skipped: t.Number(),
					failed: t.Number(),
					emails: t.Object({
						sent: t.Number(),
						delivered: t.Number(),
						opened: t.Number(),
						clicked: t.Number(),
						bounced: t.Number(),
					}),
				}),
				{ description: "What happened at each step, across every run" },
			),
			daily: t.Array(
				t.Object({
					date: t.String(),
					...runCounts,
					emails: t.Object(emailCounts),
				}),
				{
					description:
						"Per day: runs started (by their current status) and what happened to this automation's emails",
				},
			),
		},
		{
			examples: [
				{
					runs: {
						total: 120,
						active: 14,
						completed: 98,
						cancelled: 5,
						failed: 3,
						averageDurationMs: 86400000,
					},
					emails: {
						sent: 196,
						delivered: 190,
						opened: 121,
						clicked: 37,
						bounced: 2,
					},
					steps: [
						{
							nodeId: "welcome_pro",
							nodeType: "send_email",
							pending: 0,
							running: 0,
							completed: 40,
							skipped: 1,
							failed: 0,
							emails: {
								sent: 40,
								delivered: 39,
								opened: 28,
								clicked: 11,
								bounced: 0,
							},
						},
					],
					daily: [
						{
							date: "2026-03-23",
							total: 6,
							active: 1,
							completed: 5,
							cancelled: 0,
							failed: 0,
							emails: {
								sent: 5,
								delivered: 5,
								opened: 3,
								clicked: 1,
								bounced: 0,
							},
						},
					],
				},
			],
		},
	);
}
