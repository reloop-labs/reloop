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
const createTopicId = () => `tpc_${createId()}`;

/**
 * Topic table - represents a category/interest that contacts can subscribe to
 * Previously known as "audienceTopic"
 */
export const topic = pgTable(
  "topic",
  {
    id: text("id")
      .$defaultFn(() => createTopicId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
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
    index("topic_idx_organization_id").on(table.organizationId),
    index("topic_idx_name").on(table.name),
  ],
);

export type Topic = typeof topic.$inferSelect;
export type NewTopic = typeof topic.$inferInsert;
