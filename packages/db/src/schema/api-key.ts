import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const apikey = pgTable(
	"apikey",
	{
		id: text("id").primaryKey(),
		name: text("name"),
		start: text("start"),
		prefix: text("prefix"),
		key: text("key").notNull(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		refillInterval: integer("refill_interval"),
		refillAmount: integer("refill_amount"),
		lastRefillAt: timestamp("last_refill_at"),
		enabled: boolean("enabled").notNull().default(true),
		rateLimitEnabled: boolean("rate_limit_enabled").notNull().default(true),
		rateLimitTimeWindow: integer("rate_limit_time_window")
			.notNull()
			.default(86400000),
		rateLimitMax: integer("rate_limit_max").notNull().default(10),
		requestCount: integer("request_count").notNull().default(0),
		remaining: integer("remaining"),
		lastRequest: timestamp("last_request"),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
		permissions: text("permissions"),
		metadata: text("metadata"),
	},
	(table) => [
		index("apikey_key_idx").on(table.key),
		index("apikey_organizationId_idx").on(table.organizationId),
		index("apikey_userId_idx").on(table.userId),
	],
);

export const apikeyRelations = relations(apikey, ({ one }) => ({
	user: one(user, {
		fields: [apikey.userId],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [apikey.organizationId],
		references: [organization.id],
	}),
}));

export const userApiKeyRelations = relations(user, ({ many }) => ({
	apikeys: many(apikey),
}));
