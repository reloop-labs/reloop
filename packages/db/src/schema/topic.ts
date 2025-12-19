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

const visibilityEnum = pgEnum("visibility", [
  "private",
  "public",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "enrolled",
  "unenrolled",
]);


const createTopicSubscriptionId = () => `sub_${createId()}`
const createTopicId = () => `tpc_${createId()}`;

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
    visibility: visibilityEnum("visibility").notNull().default("private"),
    autoEnroll: enrollmentStatusEnum("enrollment_status").notNull().default("enrolled"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("topic_idx_organization_id").on(table.organizationId),
    index("topic_idx_name").on(table.name),
    index("topic_idx_user_id").on(table.userId),
  ],
);


export const topicEnrollment = pgTable(
  "topic_enrollment",
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
    status: enrollmentStatusEnum("status").notNull().default("enrolled"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("topic_subscription_idx_contact_id").on(table.contactId),
    index("topic_subscription_idx_topic_id").on(table.topicId),
    index("topic_subscription_idx_organization_id").on(table.organizationId),
    index("topic_subscription_idx_status").on(table.status),
    unique("topic_subscription_unique").on(table.contactId, table.topicId),
  ],
);


export const contactRelations = relations(contact, ({ one, many }) => ({
  organization: one(organization, {
    fields: [contact.organizationId],
    references: [organization.id],
  }),
  enrollments: many(topicEnrollment),
}));

export const topicRelations = relations(topic, ({ one, many }) => ({
  organization: one(organization, {
    fields: [topic.organizationId],
    references: [organization.id],
  }),
  enrollments: many(topicEnrollment),
}));

export const topicEnrollmentRelations = relations(
  topicEnrollment,
  ({ one }) => ({
    contact: one(contact, {
      fields: [topicEnrollment.contactId],
      references: [contact.id],
    }),
    topic: one(topic, {
      fields: [topicEnrollment.topicId],
      references: [topic.id],
    }),
    organization: one(organization, {
      fields: [topicEnrollment.organizationId],
      references: [organization.id],
    }),
  }),
);

export type TopicEnrollment = typeof topicEnrollment.$inferSelect;
export type NewTopicEnrollment = typeof topicEnrollment.$inferInsert;

export type Topic = typeof topic.$inferSelect;
export type NewTopic = typeof topic.$inferInsert;

