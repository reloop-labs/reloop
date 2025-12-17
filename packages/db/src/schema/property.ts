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
const createPropertyId = () => `prop_${createId()}`;

/**
 * Property table - represents dynamic properties/fields for contacts
 * Properties can be of type "string" or "number" with optional fallback values
 */
export const property = pgTable(
  "property",
  {
    id: text("id")
      .$defaultFn(() => createPropertyId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // "string" | "number"
    fallbackValue: text("fallback_value"),
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
    index("property_idx_organization_id").on(table.organizationId),
    index("property_idx_name").on(table.name),
    index("property_idx_type").on(table.type),
  ],
);

export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
