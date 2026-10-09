import { createId } from "@paralleldrive/cuid2";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const createStartupApplicationId = () => `sap_${createId()}`;

export const startupApplicationStatusEnum = pgEnum(
	"startup_application_status",
	["pending", "approved", "rejected", "contacted"],
);

export const startupApplication = pgTable(
	"startup_application",
	{
		id: text("id")
			.$defaultFn(() => createStartupApplicationId())
			.primaryKey(),
		email: text("email").notNull(),
		fullName: text("full_name").notNull(),
		company: text("company").notNull(),
		website: text("website"),
		role: text("role"),
		monthlyVolume: text("monthly_volume"),
		useCase: text("use_case").notNull(),
		status: startupApplicationStatusEnum("status").notNull().default("pending"),
		reviewedAt: timestamp("reviewed_at"),
		reviewNote: text("review_note"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("startup_application_email_idx").on(table.email),
		index("startup_application_status_idx").on(table.status),
		index("startup_application_created_idx").on(table.createdAt),
	],
);

export type StartupApplication = typeof startupApplication.$inferSelect;
export type NewStartupApplication = typeof startupApplication.$inferInsert;
