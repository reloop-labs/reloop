import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { contact } from "./contact";
import { topic } from "./topic";

// Custom ID generation function with prefix
const createTopicSubscriptionId = () => `sub_${createId()}`;

// Subscription status enum
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "subscribed",
  "unsubscribed",
]);

/**
 * TopicSubscription table - represents a contact's subscription to a topic
 * Previously known as "audienceTopicMapper"
 */
export const topicSubscription = pgTable(
  "topic_subscription",
  {
    id: text("id")
      .$defaultFn(() => createTopicSubscriptionId())
      .primaryKey(),
    contactId: text("contact_id")
      .notNull()
      .references(() => contact.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topic.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: subscriptionStatusEnum("status").notNull().default("subscribed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("topic_subscription_idx_contact_id").on(table.contactId),
    index("topic_subscription_idx_topic_id").on(table.topicId),
    index("topic_subscription_idx_organization_id").on(table.organizationId),
    index("topic_subscription_idx_status").on(table.status),
    unique("topic_subscription_unique").on(table.contactId, table.topicId),
  ],
);

// All relations defined here to avoid circular imports

export const contactRelations = relations(contact, ({ one, many }) => ({
  organization: one(organization, {
    fields: [contact.organizationId],
    references: [organization.id],
  }),
  subscriptions: many(topicSubscription),
}));

export const topicRelations = relations(topic, ({ one, many }) => ({
  organization: one(organization, {
    fields: [topic.organizationId],
    references: [organization.id],
  }),
  subscriptions: many(topicSubscription),
}));

export const topicSubscriptionRelations = relations(
  topicSubscription,
  ({ one }) => ({
    contact: one(contact, {
      fields: [topicSubscription.contactId],
      references: [contact.id],
    }),
    topic: one(topic, {
      fields: [topicSubscription.topicId],
      references: [topic.id],
    }),
    organization: one(organization, {
      fields: [topicSubscription.organizationId],
      references: [organization.id],
    }),
  }),
);

export type TopicSubscription = typeof topicSubscription.$inferSelect;
export type NewTopicSubscription = typeof topicSubscription.$inferInsert;
