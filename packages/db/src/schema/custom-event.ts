import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

const createCustomEventId = () => `evt_${createId()}`;
const createCustomEventPropertyId = () => `evtp_${createId()}`;

/** Property types for user-defined event schemas. */
export const customEventPropertyTypeEnum = pgEnum(
	"custom_event_property_type",
	["string", "number", "boolean"],
);

/**
 * Org-defined **workflow** event catalog (automation triggers only).
 * Independent of platform `@reloop/webhook-events` and outbound webhooks.
 */
export const customEvent = pgTable(
	"custom_event",
	{
		id: text("id")
			.$defaultFn(() => createCustomEventId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Display name, e.g. "User signed up" */
		name: varchar("name", { length: 255 }).notNull(),
		/**
		 * Stable machine key used in the track API and automation triggers
		 * (e.g. `user.signed_up`). Unique per organization.
		 */
		key: varchar("key", { length: 128 }).notNull(),
		description: text("description"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("custom_event_idx_organization_id").on(table.organizationId),
		index("custom_event_idx_key").on(table.key),
		index("custom_event_idx_user_id").on(table.userId),
		unique("custom_event_unique_org_key").on(table.organizationId, table.key),
	],
);

export const customEventProperty = pgTable(
	"custom_event_property",
	{
		id: text("id")
			.$defaultFn(() => createCustomEventPropertyId())
			.primaryKey(),
		eventId: text("event_id")
			.notNull()
			.references(() => customEvent.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		/** Property key in the track payload, e.g. `plan` */
		name: varchar("name", { length: 128 }).notNull(),
		propertyType: customEventPropertyTypeEnum("property_type")
			.notNull()
			.default("string"),
		required: boolean("required").notNull().default(false),
		defaultValue: varchar("default_value", { length: 512 }),
		description: text("description"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("custom_event_property_idx_event_id").on(table.eventId),
		index("custom_event_property_idx_organization_id").on(table.organizationId),
		unique("custom_event_property_unique_event_name").on(
			table.eventId,
			table.name,
		),
	],
);

export const customEventRelations = relations(customEvent, ({ one, many }) => ({
	organization: one(organization, {
		fields: [customEvent.organizationId],
		references: [organization.id],
	}),
	createdBy: one(user, {
		fields: [customEvent.userId],
		references: [user.id],
	}),
	properties: many(customEventProperty),
}));

export const customEventPropertyRelations = relations(
	customEventProperty,
	({ one }) => ({
		event: one(customEvent, {
			fields: [customEventProperty.eventId],
			references: [customEvent.id],
		}),
	}),
);
