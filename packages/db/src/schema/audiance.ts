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
import { organization } from "./auth";

// Custom ID generation functions with prefixes
const createAudienceId = () => `aud_${createId()}`;
const createAudienceTopicId = () => `audtpc_${createId()}`;
const createAudienceTopicMapperId = () => `audtpcmap_${createId()}`;

// Subscription status enum for the mapper table
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "subscribed",
  "unsubscribed",
]);

export const audience = pgTable(
  "audience",
  {
    id: text("id")
      .$defaultFn(() => createAudienceId())
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
    index("audience_idx_email").on(table.email),
    index("audience_idx_organization_id").on(table.organizationId),
    index("audience_idx_org_email").on(table.organizationId, table.email),
  ],
);

export const audienceTopic = pgTable(
  "audience_topic",
  {
    id: text("id")
      .$defaultFn(() => createAudienceTopicId())
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
    index("audience_topic_idx_organization_id").on(table.organizationId),
    index("audience_topic_idx_name").on(table.name),
  ],
);

export const audienceTopicMapper = pgTable(
  "audience_topic_mapper",
  {
    id: text("id")
      .$defaultFn(() => createAudienceTopicMapperId())
      .primaryKey(),
    audienceId: text("audience_id")
      .notNull()
      .references(() => audience.id, { onDelete: "cascade" }),
    audienceTopicId: text("audience_topic_id")
      .notNull()
      .references(() => audienceTopic.id, { onDelete: "cascade" }),
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
    index("audience_topic_mapper_idx_audience_id").on(table.audienceId),
    index("audience_topic_mapper_idx_topic_id").on(table.audienceTopicId),
    index("audience_topic_mapper_idx_organization_id").on(table.organizationId),
    index("audience_topic_mapper_idx_status").on(table.status),
    unique("audience_topic_mapper_unique").on(
      table.audienceId,
      table.audienceTopicId,
    ),
  ],
);

export const audienceRelations = relations(audience, ({ one, many }) => ({
  organization: one(organization, {
    fields: [audience.organizationId],
    references: [organization.id],
  }),
  topicMappings: many(audienceTopicMapper),
}));

export const audienceTopicRelations = relations(
  audienceTopic,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [audienceTopic.organizationId],
      references: [organization.id],
    }),
    audienceMappings: many(audienceTopicMapper),
  }),
);

export const audienceTopicMapperRelations = relations(
  audienceTopicMapper,
  ({ one }) => ({
    audience: one(audience, {
      fields: [audienceTopicMapper.audienceId],
      references: [audience.id],
    }),
    audienceTopic: one(audienceTopic, {
      fields: [audienceTopicMapper.audienceTopicId],
      references: [audienceTopic.id],
    }),
    organization: one(organization, {
      fields: [audienceTopicMapper.organizationId],
      references: [organization.id],
    }),
  }),
);

export const audienceTables = {
  audience,
  audienceTopic,
  audienceTopicMapper,
} as const;

export type AudienceTable = typeof audienceTables;
