import { createId } from "@paralleldrive/cuid2";
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
    status: varchar("status", { length: 20 }).notNull().default("Subscribed"),
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
    index("contact_idx_status").on(table.status),
  ],
);

export type Contact = typeof contact.$inferSelect;
export type NewContact = typeof contact.$inferInsert;
