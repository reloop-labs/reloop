import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { contact } from "./contact";
import { emailLog } from "./email";

const createAutomationId = () => `auto_${createId()}`;
const createAutomationVersionId = () => `autov_${createId()}`;
const createAutomationEnrollmentId = () => `enr_${createId()}`;
const createAutomationStepRunId = () => `astep_${createId()}`;

export const automationStatusEnum = pgEnum("automation_status", [
	"draft",
	"active",
	"paused",
]);

export const automationEnrollmentStatusEnum = pgEnum(
	"automation_enrollment_status",
	["active", "completed", "cancelled", "failed"],
);

export const automationStepRunStatusEnum = pgEnum(
	"automation_step_run_status",
	["pending", "running", "completed", "skipped", "failed"],
);

/** Draft or published graph stored as JSON (React Flow nodes + edges). */
export type AutomationGraph = {
	nodes: Array<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: Record<string, unknown>;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
		type?: string;
		data?: Record<string, unknown>;
	}>;
};

export const automation = pgTable(
	"automation",
	{
		id: text("id")
			.$defaultFn(() => createAutomationId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		status: automationStatusEnum("status").notNull().default("draft"),
		/** Webhook-style event id, e.g. contact.create */
		triggerEvent: varchar("trigger_event", { length: 128 }),
		/** Editable draft graph */
		graph: jsonb("graph")
			.$type<AutomationGraph>()
			.notNull()
			.default({ nodes: [], edges: [] }),
		activeVersionId: text("active_version_id"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("automation_idx_organization_id").on(table.organizationId),
		index("automation_idx_status").on(table.status),
		index("automation_idx_trigger_event").on(table.triggerEvent),
		index("automation_idx_org_status_trigger").on(
			table.organizationId,
			table.status,
			table.triggerEvent,
		),
	],
);

export const automationVersion = pgTable(
	"automation_version",
	{
		id: text("id")
			.$defaultFn(() => createAutomationVersionId())
			.primaryKey(),
		automationId: text("automation_id")
			.notNull()
			.references(() => automation.id, { onDelete: "cascade" }),
		version: integer("version").notNull(),
		triggerEvent: varchar("trigger_event", { length: 128 }).notNull(),
		graph: jsonb("graph").$type<AutomationGraph>().notNull(),
		createdByUserId: text("created_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("automation_version_idx_automation_id").on(table.automationId),
		unique("automation_version_unique").on(table.automationId, table.version),
	],
);

export const automationEnrollment = pgTable(
	"automation_enrollment",
	{
		id: text("id")
			.$defaultFn(() => createAutomationEnrollmentId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		automationId: text("automation_id")
			.notNull()
			.references(() => automation.id, { onDelete: "cascade" }),
		versionId: text("version_id")
			.notNull()
			.references(() => automationVersion.id, { onDelete: "cascade" }),
		contactId: text("contact_id")
			.notNull()
			.references(() => contact.id, { onDelete: "cascade" }),
		status: automationEnrollmentStatusEnum("status")
			.notNull()
			.default("active"),
		currentNodeId: text("current_node_id"),
		enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
		completedAt: timestamp("completed_at"),
		cancelledAt: timestamp("cancelled_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("automation_enrollment_idx_org").on(table.organizationId),
		index("automation_enrollment_idx_automation").on(table.automationId),
		index("automation_enrollment_idx_contact").on(table.contactId),
		index("automation_enrollment_idx_status").on(table.status),
		// One enrollment per automation+contact (no re-enroll in v1)
		unique("automation_enrollment_unique").on(
			table.automationId,
			table.contactId,
		),
	],
);

export const automationStepRun = pgTable(
	"automation_step_run",
	{
		id: text("id")
			.$defaultFn(() => createAutomationStepRunId())
			.primaryKey(),
		enrollmentId: text("enrollment_id")
			.notNull()
			.references(() => automationEnrollment.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		nodeId: text("node_id").notNull(),
		nodeType: varchar("node_type", { length: 64 }).notNull(),
		status: automationStepRunStatusEnum("status").notNull().default("pending"),
		scheduledFor: timestamp("scheduled_for").notNull().defaultNow(),
		startedAt: timestamp("started_at"),
		finishedAt: timestamp("finished_at"),
		emailLogId: text("email_log_id").references(() => emailLog.id, {
			onDelete: "set null",
		}),
		error: text("error"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("automation_step_run_idx_enrollment").on(table.enrollmentId),
		index("automation_step_run_idx_status_scheduled").on(
			table.status,
			table.scheduledFor,
		),
		index("automation_step_run_idx_org").on(table.organizationId),
	],
);

export const automationRelations = relations(automation, ({ one, many }) => ({
	organization: one(organization, {
		fields: [automation.organizationId],
		references: [organization.id],
	}),
	createdBy: one(user, {
		fields: [automation.userId],
		references: [user.id],
	}),
	versions: many(automationVersion),
	enrollments: many(automationEnrollment),
}));

export const automationVersionRelations = relations(
	automationVersion,
	({ one, many }) => ({
		automation: one(automation, {
			fields: [automationVersion.automationId],
			references: [automation.id],
		}),
		createdBy: one(user, {
			fields: [automationVersion.createdByUserId],
			references: [user.id],
		}),
		enrollments: many(automationEnrollment),
	}),
);

export const automationEnrollmentRelations = relations(
	automationEnrollment,
	({ one, many }) => ({
		automation: one(automation, {
			fields: [automationEnrollment.automationId],
			references: [automation.id],
		}),
		version: one(automationVersion, {
			fields: [automationEnrollment.versionId],
			references: [automationVersion.id],
		}),
		contact: one(contact, {
			fields: [automationEnrollment.contactId],
			references: [contact.id],
		}),
		stepRuns: many(automationStepRun),
	}),
);

export const automationStepRunRelations = relations(
	automationStepRun,
	({ one }) => ({
		enrollment: one(automationEnrollment, {
			fields: [automationStepRun.enrollmentId],
			references: [automationEnrollment.id],
		}),
	}),
);
