import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

const createUploadId = () => `up_${createId()}`;

export const upload = pgTable(
    "upload",
    {
        id: text("id")
            .$defaultFn(() => createUploadId())
            .primaryKey(),
        filename: varchar("filename", { length: 255 }).notNull(),
        originalName: varchar("original_name", { length: 255 }).notNull(),
        mimeType: varchar("mime_type", { length: 100 }).notNull(),
        size: integer("size").notNull(),
        path: text("path").notNull(),
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
        index("upload_idx_organization_id").on(table.organizationId),
        index("upload_idx_user_id").on(table.userId),
        index("upload_idx_deleted_at").on(table.deletedAt),
        index("upload_idx_org_deleted").on(table.organizationId, table.deletedAt),
        index("upload_idx_filename").on(table.filename),
    ],
);

export const uploadRelations = relations(upload, ({ one }) => ({
    organization: one(organization, {
        fields: [upload.organizationId],
        references: [organization.id],
    }),
    user: one(user, {
        fields: [upload.userId],
        references: [user.id],
    }),
}));

export const uploadTables = {
    upload,
} as const;

export type UploadTable = typeof uploadTables;

