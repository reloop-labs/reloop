import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { contact } from "./contact";

export const visibilityEnum = pgEnum("visibility", ["private", "public"]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
	"enrolled",
	"unenrolled",
]);

export const defaultSubscriptionEnum = pgEnum("default_subscription", [
	"opt_in",
	"opt_out",
]);

export const createChannelSubscriptionId = () => `sub_${createId()}`;
export const createChannelId = () => `chn_${createId()}`;

export const channel = pgTable(
	"channel",
	{
		id: text("id")
			.$defaultFn(() => createChannelId())
			.primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		visibility: visibilityEnum("visibility").notNull().default("private"),
		defaultSubscription: defaultSubscriptionEnum("default_subscription")
			.notNull()
			.default("opt_in"),

		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		deletedAt: timestamp("deleted_at"),
	},
	(table) => [
		index("channel_idx_organization_id").on(table.organizationId),
		index("channel_idx_name").on(table.name),
		index("channel_idx_user_id").on(table.userId),
	],
);

export const channelSubscription = pgTable(
	"channel_subscription",
	{
		id: text("id")
			.$defaultFn(() => createChannelSubscriptionId())
			.primaryKey(),
		contactId: text("contact_id")
			.notNull()
			.references(() => contact.id, { onDelete: "cascade" }),
		channelId: text("channel_id")
			.notNull()
			.references(() => channel.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		status: enrollmentStatusEnum("status").notNull().default("enrolled"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		deletedAt: timestamp("deleted_at"),
	},
	(table) => [
		index("channel_subscription_idx_contact_id").on(table.contactId),
		index("channel_subscription_idx_channel_id").on(table.channelId),
		index("channel_subscription_idx_organization_id").on(table.organizationId),
		index("channel_subscription_idx_status").on(table.status),
		unique("channel_subscription_unique").on(table.contactId, table.channelId),
	],
);

export const channelRelations = relations(channel, ({ one, many }) => ({
	organization: one(organization, {
		fields: [channel.organizationId],
		references: [organization.id],
	}),
	subscriptions: many(channelSubscription),
}));

export const channelSubscriptionRelations = relations(
	channelSubscription,
	({ one }) => ({
		contact: one(contact, {
			fields: [channelSubscription.contactId],
			references: [contact.id],
			relationName: "contactChannels",
		}),
		channel: one(channel, {
			fields: [channelSubscription.channelId],
			references: [channel.id],
		}),
		organization: one(organization, {
			fields: [channelSubscription.organizationId],
			references: [organization.id],
		}),
	}),
);

export type ChannelSubscription = typeof channelSubscription.$inferSelect;
export type NewChannelSubscription = typeof channelSubscription.$inferInsert;

export type Channel = typeof channel.$inferSelect;
export type NewChannel = typeof channel.$inferInsert;
