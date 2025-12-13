import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

// Custom ID generation
const createTemplateId = () => `tmpl_${createId()}`;
const createTemplateVersionId = () => `tmpl_ver_${createId()}`;

// Template status enum
export const templateStatusEnum = pgEnum("template_status", [
    "draft",
    "published",
    "archived",
]);

// Block type enum for email components
export const templateBlockTypeEnum = pgEnum("template_block_type", [
    "heading",
    "text",
    "button",
    "image",
    "divider",
    "spacer",
    "section",
    "container",
    "columns",
    "html",
]);

// TypeScript types for template blocks
export interface TemplateBlockBase {
    id: string;
    type: string;
    props: Record<string, unknown>;
}

export interface TemplateBlock extends TemplateBlockBase {
    children?: TemplateBlock[];
}

// Main template table
export const template = pgTable(
    "template",
    {
        id: text("id")
            .$defaultFn(() => createTemplateId())
            .primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        subject: varchar("subject", { length: 500 }),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        createdByUserId: text("created_by_user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        status: templateStatusEnum("status").notNull().default("draft"),
        // The template content as Lexical JSON state
        content: jsonb("content").$type<TemplateBlock[]>().notNull().default([]),
        // Extracted variables from content
        variables: jsonb("variables").$type<string[]>().default([]),
        // Current published version number
        currentVersion: integer("current_version").default(1),
        // Thumbnail preview URL
        thumbnailUrl: text("thumbnail_url"),
        // Metadata
        isDefault: boolean("is_default").notNull().default(false),
        deletedAt: timestamp("deleted_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("template_idx_organization_id").on(table.organizationId),
        index("template_idx_created_by").on(table.createdByUserId),
        index("template_idx_status").on(table.status),
        index("template_idx_name").on(table.name),
        index("template_idx_org_status").on(table.organizationId, table.status),
        index("template_idx_deleted_at").on(table.deletedAt),
    ],
);

// Template version history for rollback support
export const templateVersion = pgTable(
    "template_version",
    {
        id: text("id")
            .$defaultFn(() => createTemplateVersionId())
            .primaryKey(),
        templateId: text("template_id")
            .notNull()
            .references(() => template.id, { onDelete: "cascade" }),
        version: integer("version").notNull(),
        subject: varchar("subject", { length: 500 }),
        content: jsonb("content").$type<TemplateBlock[]>().notNull(),
        variables: jsonb("variables").$type<string[]>().default([]),
        // Rendered HTML for quick access
        renderedHtml: text("rendered_html"),
        createdByUserId: text("created_by_user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("template_version_idx_template_id").on(table.templateId),
        index("template_version_idx_version").on(table.version),
    ],
);

// Relations
export const templateRelations = relations(template, ({ one, many }) => ({
    organization: one(organization, {
        fields: [template.organizationId],
        references: [organization.id],
    }),
    createdBy: one(user, {
        fields: [template.createdByUserId],
        references: [user.id],
    }),
    versions: many(templateVersion),
}));

export const templateVersionRelations = relations(
    templateVersion,
    ({ one }) => ({
        template: one(template, {
            fields: [templateVersion.templateId],
            references: [template.id],
        }),
        createdBy: one(user, {
            fields: [templateVersion.createdByUserId],
            references: [user.id],
        }),
    }),
);

export const templateTables = {
    template,
    templateVersion,
} as const;

export type TemplateTable = typeof templateTables;
