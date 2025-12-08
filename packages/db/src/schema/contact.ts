import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

// Custom ID generation function with prefix
const createContactId = () => `con_${createId()}`;

/**
 * Contact table - represents a person/recipient in the system
 * Previously known as "audience"
 */
export const contact = pgTable(
  "contact",
  {
    id: text("id")
      .$defaultFn(() => createContactId())
      .primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
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
  ],
);

export type Contact = typeof contact.$inferSelect;
export type NewContact = typeof contact.$inferInsert;
