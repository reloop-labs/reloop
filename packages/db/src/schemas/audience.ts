import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { apikeys, organizations, users } from "./auth";

export const audience = pgTable(
	"audience",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		apiKeyId: text("api_key_id")
			.notNull()
			.references(() => apikeys.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("idx_audience_organization_id").on(table.organizationId),
		index("idx_audience_email_org_id").on(table.email, table.organizationId),
		index("idx_audience_user_id").on(table.userId),
		index("idx_audience_api_key_id").on(table.apiKeyId),
	],
);
