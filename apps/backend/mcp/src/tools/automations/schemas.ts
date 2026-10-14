import * as z from "zod";
import type { Automation, Enrollment, StepRun } from "../../reloop/types";
import { emailSchema, resourceIdSchema } from "../contacts/schemas";

export const automationIdSchema = resourceIdSchema.describe(
	"Automation ID as returned by Reloop, for example auto_123456789",
);

export const enrollmentIdSchema = resourceIdSchema.describe(
	"Enrollment ID as returned by Reloop, for example enr_123456789",
);

const stepKeySchema = z
	.string()
	.regex(/^[A-Za-z0-9_-]{1,64}$/)
	.describe(
		"Unique key for this step that connections refer to, for example welcome_email",
	);

const conditionRuleSchema = z.object({
	type: z.literal("rule"),
	field: z
		.string()
		.min(1)
		.max(128)
		.describe(
			"trigger.<name> for a property sent with the event (e.g. trigger.plan), contact.email / contact.firstName / contact.lastName / contact.status, or contact.<name> for a contact property",
		),
	operator: z
		.enum([
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
		])
		.describe(
			"Text compares ignore case; gt/gte/lt/lte compare numbers; exists, not_exists and is_empty take no value",
		),
	value: z
		.union([
			z.string(),
			z.number(),
			z.boolean(),
			z.null(),
			z.object({ var: z.string().min(1) }),
		])
		.optional()
		.describe(
			'Value to compare with, or { "var": "trigger.other_field" } to compare with another field',
		),
});

const conditionGroupSchema = z.object({
	type: z
		.enum(["and", "or"])
		.describe("and: every rule matches; or: any rule matches"),
	rules: z
		.array(
			z.union([
				conditionRuleSchema,
				z.object({
					type: z.enum(["and", "or"]),
					rules: z.array(conditionRuleSchema).min(1),
				}),
			]),
		)
		.min(1),
});

export const stepSchema = z.discriminatedUnion("type", [
	z.object({
		key: stepKeySchema,
		type: z.literal("trigger"),
		config: z.object({
			eventName: z
				.string()
				.min(1)
				.max(128)
				.describe(
					"Key of the custom event that starts the automation (from list_events); the trigger. prefix is optional",
				),
		}),
	}),
	z.object({
		key: stepKeySchema,
		type: z.literal("send_email"),
		config: z.object({
			template: z.object({
				id: resourceIdSchema.describe("Template ID from list_templates"),
			}),
			from: z
				.string()
				.max(320)
				.optional()
				.describe(
					"Used only when the template has no From; must be on one of your domains",
				),
			subject: z
				.string()
				.max(998)
				.optional()
				.describe("Used only when the template has no subject"),
		}),
	}),
	z.object({
		key: stepKeySchema,
		type: z.literal("delay"),
		config: z.object({
			amount: z.number().int().min(0),
			unit: z.enum(["minutes", "hours", "days"]),
		}),
	}),
	z.object({
		key: stepKeySchema,
		type: z.literal("condition"),
		config: z.union([conditionRuleSchema, conditionGroupSchema]),
	}),
]);

export const connectionSchema = z.object({
	from: z.string().min(1).describe("Key of the step this connection leaves"),
	to: z.string().min(1).describe("Key of the step it leads to"),
	type: z
		.enum(["default", "condition_met", "condition_not_met"])
		.default("default")
		.describe(
			"default between steps; a condition step needs one condition_met (yes) and one condition_not_met (no) connection",
		),
});

export const stepsDescription =
	"The steps, with exactly one trigger. Each step has a unique key; link them with connections.";

export const automationSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	status: z
		.enum(["draft", "active", "paused"])
		.describe(
			"draft until activated; active runs for new events; paused stops it",
		),
	triggerEvent: z
		.string()
		.nullable()
		.describe("Key of the event that starts it"),
	steps: z.array(
		z.object({
			key: z.string(),
			type: z.string(),
			config: z.record(z.string(), z.unknown()),
		}),
	),
	connections: z.array(
		z.object({ from: z.string(), to: z.string(), type: z.string() }),
	),
	activeVersionId: z
		.string()
		.nullable()
		.describe(
			"Published version new enrollments use; null until first activated",
		),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toAutomationOutput(
	automation: Automation,
): z.output<typeof automationSchema> {
	return {
		id: automation.id,
		name: automation.name,
		description: automation.description,
		status: automation.status,
		triggerEvent: automation.triggerEvent,
		steps: automation.steps,
		connections: automation.connections,
		activeVersionId: automation.activeVersionId,
		createdAt: automation.createdAt,
		updatedAt: automation.updatedAt,
	};
}

export const enrollmentStatusSchema = z.enum([
	"active",
	"completed",
	"cancelled",
	"failed",
]);

export const enrollmentSchema = z.object({
	id: z.string(),
	automationId: z.string(),
	contactId: z.string(),
	contactEmail: z.string().nullable(),
	contactFirstName: z.string().nullable(),
	contactLastName: z.string().nullable(),
	status: enrollmentStatusSchema,
	currentStep: z
		.string()
		.nullable()
		.describe("Key of the step it is on or waiting at"),
	enrolledAt: z.string(),
	completedAt: z.string().nullable(),
	cancelledAt: z.string().nullable(),
});

export function toEnrollmentOutput(
	enrollment: Enrollment,
): z.output<typeof enrollmentSchema> {
	return {
		id: enrollment.id,
		automationId: enrollment.automationId,
		contactId: enrollment.contactId,
		contactEmail: enrollment.contactEmail,
		contactFirstName: enrollment.contactFirstName,
		contactLastName: enrollment.contactLastName,
		status: enrollment.status,
		currentStep: enrollment.currentNodeId,
		enrolledAt: enrollment.enrolledAt,
		completedAt: enrollment.completedAt,
		cancelledAt: enrollment.cancelledAt,
	};
}

export const stepRunSchema = z.object({
	id: z.string(),
	step: z.string().describe("Key of the step"),
	stepType: z.string(),
	status: z.enum(["pending", "running", "completed", "skipped", "failed"]),
	scheduledFor: z.string(),
	startedAt: z.string().nullable(),
	finishedAt: z.string().nullable(),
	emailId: z
		.string()
		.nullable()
		.describe("Email a send_email step sent; look it up with get_email"),
	error: z.string().nullable().describe("Why it was skipped or failed"),
});

export function toStepRunOutput(run: StepRun): z.output<typeof stepRunSchema> {
	return {
		id: run.id,
		step: run.nodeId,
		stepType: run.nodeType,
		status: run.status,
		scheduledFor: run.scheduledFor,
		startedAt: run.startedAt,
		finishedAt: run.finishedAt,
		emailId: run.emailLogId,
		error: run.error,
	};
}

/** `contactId`, or `email` (which creates the contact if it does not exist). */
export const contactTargetShape = {
	contactId: resourceIdSchema
		.optional()
		.describe("Contact ID, for example con_123456789. Pass this or email."),
	email: emailSchema
		.optional()
		.describe("Contact email. Creates the contact if it does not exist yet."),
	firstName: z
		.string()
		.trim()
		.max(255)
		.optional()
		.describe("Used only when the contact is created from email"),
	lastName: z
		.string()
		.trim()
		.max(255)
		.optional()
		.describe("Used only when the contact is created from email"),
};

export function hasContactTarget(value: {
	contactId?: string;
	email?: string;
}): boolean {
	return value.contactId !== undefined || value.email !== undefined;
}

export const contactTargetMessage = "Pass contactId or email";

export const paginationSchema = z.object({
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	hasMore: z.boolean(),
});
