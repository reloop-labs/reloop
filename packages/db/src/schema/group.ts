import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { contact } from "./contact";

export const createGroupId = () => `grp_${createId()}`;
export const createContactGroupId = () => `cgr_${createId()}`;

export const group = pgTable(
  "group",
  {
    id: text("id")
      .$defaultFn(() => createGroupId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
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
    index("group_idx_organization_id").on(table.organizationId),
    index("group_idx_name").on(table.name),
  ],
);

export const contactGroup = pgTable(
  "contact_group",
  {
    id: text("id")
      .$defaultFn(() => createContactGroupId())
      .primaryKey(),
    contactId: text("contact_id")
      .notNull()
      .references(() => contact.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
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
    index("contact_group_idx_contact_id").on(table.contactId),
    index("contact_group_idx_group_id").on(table.groupId),
    index("contact_group_idx_organization_id").on(table.organizationId),
    unique("contact_group_unique").on(table.contactId, table.groupId),
  ],
);

export const groupRelations = relations(group, ({ one, many }) => ({
  organization: one(organization, {
    fields: [group.organizationId],
    references: [organization.id],
  }),
  contactGroups: many(contactGroup),
}));

export const contactGroupRelations = relations(contactGroup, ({ one }) => ({
  contact: one(contact, {
    fields: [contactGroup.contactId],
    references: [contact.id],
  }),
  group: one(group, {
    fields: [contactGroup.groupId],
    references: [group.id],
  }),
  organization: one(organization, {
    fields: [contactGroup.organizationId],
    references: [organization.id],
  }),
}));

export type Group = typeof group.$inferSelect;
export type NewGroup = typeof group.$inferInsert;

export type ContactGroup = typeof contactGroup.$inferSelect;
export type NewContactGroup = typeof contactGroup.$inferInsert;
