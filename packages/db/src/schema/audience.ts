import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

// Custom ID generation functions with prefixes
const createAudienceGroupId = () => `audgrp_${createId()}`;
const createAudienceId = () => `aud_${createId()}`;

export const audienceStatusEnum = pgEnum("audience_status", [
    "subscribed",
    "unsubscribed",
]);

export const audienceGroup = pgTable(
    "audience_group",
    {
        id: text("id")
            .$defaultFn(() => createAudienceGroupId())
            .primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        deletedAt: timestamp("deleted_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("audience_group_idx_organization_id").on(table.organizationId),
        index("audience_group_idx_user_id").on(table.userId),
        index("audience_group_idx_deleted_at").on(table.deletedAt),
        index("audience_group_idx_org_deleted").on(
            table.organizationId,
            table.deletedAt,
        ),
    ],
);

export const audience = pgTable(
    "audience",
    {
        id: text("id")
            .$defaultFn(() => createAudienceId())
            .primaryKey(),
        email: varchar("email", { length: 255 }).notNull(),
        firstName: varchar("first_name", { length: 255 }),
        lastName: varchar("last_name", { length: 255 }),
        phone: varchar("phone", { length: 50 }),
        metadata: jsonb("metadata").$type<Record<string, unknown>>(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        status: audienceStatusEnum("status").notNull().default("subscribed"),
        addedAt: timestamp("added_at").notNull().defaultNow(),
        unsubscribedAt: timestamp("unsubscribed_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
        audienceGroupId: text("audience_group_id")
            .notNull()
            .references(() => audienceGroup.id, { onDelete: "cascade" }),
    },
    (table) => [
        index("audience_idx_email").on(table.email),
        index("audience_idx_organization_id").on(table.organizationId),
        index("audience_idx_org_email").on(table.organizationId, table.email),
        index("audience_idx_status").on(table.status),
        index("audience_idx_org_status").on(table.organizationId, table.status),
        index("audience_idx_group_id").on(table.audienceGroupId),
    ],
);



export const audienceGroupRelations = relations(
    audienceGroup,
    ({ one, many }) => ({
        organization: one(organization, {
            fields: [audienceGroup.organizationId],
            references: [organization.id],
        }),
        user: one(user, {
            fields: [audienceGroup.userId],
            references: [user.id],
        }),
        audience: many(audience),
    }),
);

export const audienceRelations = relations(audience, ({ one }) => ({
    organization: one(organization, {
        fields: [audience.organizationId],
        references: [organization.id],
    }),
    audienceGroup: one(audienceGroup, {
        fields: [audience.audienceGroupId],
        references: [audienceGroup.id],
    }),
}));

export const audienceTables = {
    audienceGroup,
    audience,
} as const;

export type AudienceTable = typeof audienceTables;

