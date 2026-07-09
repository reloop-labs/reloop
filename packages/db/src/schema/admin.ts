import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

const createAdminAuditLogId = () => `aal_${createId()}`;

export const adminAuditLog = pgTable(
	"admin_audit_log",
	{
		id: text("id")
			.$defaultFn(() => createAdminAuditLogId())
			.primaryKey(),
		actorUserId: text("actor_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		action: text("action").notNull(),
		resourceType: text("resource_type").notNull(),
		resourceId: text("resource_id"),
		organizationId: text("organization_id").references(() => organization.id, {
			onDelete: "set null",
		}),
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("admin_audit_log_actor_idx").on(table.actorUserId),
		index("admin_audit_log_action_idx").on(table.action),
		index("admin_audit_log_created_idx").on(table.createdAt),
		index("admin_audit_log_org_idx").on(table.organizationId),
	],
);

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
	actor: one(user, {
		fields: [adminAuditLog.actorUserId],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [adminAuditLog.organizationId],
		references: [organization.id],
	}),
}));
