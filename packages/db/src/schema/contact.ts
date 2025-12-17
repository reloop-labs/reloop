import { createId } from "@paralleldrive/cuid2";
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

const createContactId = () => `con_${createId()}`;
const createContactPropertyValueId = () => `cpv_${createId()}`;
const createContactPropertyId = () => `cp_${createId()}`;

export const contactStatusEnum = pgEnum("contact_status", [
  "subscribed",
  "unsubscribed",
  "blocked",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "string",
  "number",
]);

export const contact = pgTable(
  "contact",
  {
    id: text("id")
      .$defaultFn(() => createContactId())
      .primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    status: contactStatusEnum("status").notNull().default("subscribed"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("contact_idx_email").on(table.email),
    index("contact_idx_organization_id").on(table.organizationId),
    index("contact_idx_org_email").on(table.organizationId, table.email),
    index("contact_idx_status").on(table.status),
    index("contact_idx_user_id").on(table.userId),
    unique("contact_unique_org_email").on(table.organizationId, table.email),
  ],
);

export const contactProperty = pgTable(
  "contact_property",
  {
    id: text("id")
      .$defaultFn(() => createContactPropertyId())
      .primaryKey(),
    propertyName: varchar("property_name", { length: 255 }).notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    defaultValue: varchar("default_value", { length: 255 }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    unique("contact_property_unique_org_property_name").on(table.organizationId, table.propertyName),
    index("contact_property_idx_organization_id").on(table.organizationId),
    index("contact_property_idx_user_id").on(table.userId),
    index("contact_property_idx_property_name").on(table.propertyName),
  ],
);

export const contactPropertyValue = pgTable(
  "contact_property_value",
  {
    id: text("id")
      .$defaultFn(() => createContactPropertyValueId())
      .primaryKey(),
    contactId: text("contact_id")
      .notNull()
      .references(() => contact.id, { onDelete: "cascade" }),
    propertyId: text("property_id")
      .notNull()
      .references(() => contactProperty.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("cpv_idx_contact_id").on(table.contactId),
    index("cpv_idx_property_id").on(table.propertyId),
    unique("cpv_unique_contact_property_value").on(table.contactId, table.propertyId),
    index("cpv_idx_organization_id").on(table.organizationId),
    index("cpv_idx_user_id").on(table.userId),

  ],
);

export type ContactPropertyValue = typeof contactPropertyValue.$inferSelect;
export type NewContactPropertyValue = typeof contactPropertyValue.$inferInsert;

export type Contact = typeof contact.$inferSelect;
export type NewContact = typeof contact.$inferInsert;

export type ContactProperty = typeof contactProperty.$inferSelect;
export type NewContactProperty = typeof contactProperty.$inferInsert;
