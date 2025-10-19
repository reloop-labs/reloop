import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
    bigint,
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
import { domain } from "./domain";

export const mailbox = pgTable(
    "mailbox",
    {
        username: varchar("username", { length: 255 }).primaryKey(),
        password: varchar("password", { length: 255 }).notNull(),
        passwordEncode: varchar("password_encode", { length: 255 }).notNull(),
        fullName: varchar("full_name", { length: 255 }).notNull(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id),
        userId: text("user_id")
            .notNull()
            .references(() => user.id),
        isAdmin: boolean("is_admin").notNull(),
        mailDir: varchar("mail_dir", { length: 255 }).notNull(),
        quota: bigint("quota", { mode: "number" }).notNull(),
        localPart: varchar("local_part", { length: 255 }).notNull(),
        domainId: text("domain_id")
            .notNull()
            .references(() => domain.id),
        active: boolean("active").notNull().default(true),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").notNull(),
    },
    (table) => [
        index("mailbox_idx_mailbox_domain_id").on(table.domainId),
        index("mailbox_idx_mailbox_created_at").on(table.createdAt),
        index("mailbox_idx_mailbox_organization_id").on(table.organizationId),
        index("mailbox_idx_mailbox_user_id").on(table.userId),
    ],
);

// Enums for email status and priority
export const emailStatusEnum = pgEnum("email_status", [
    "pending",
    "sent",
    "delivered",
    "failed",
    "bounced",
    "spam",
    "archived",
]);

export const emailPriorityEnum = pgEnum("email_priority", [
    "low",
    "normal",
    "high",
    "urgent",
]);

export const emailFolderEnum = pgEnum("email_folder", [
    "inbox",
    "sent",
    "drafts",
    "trash",
    "spam",
    "archive",
    "custom",
]);

// Main mailbox message table
export const mailboxMessage = pgTable(
    "mailbox_message",
    {
        id: text("id")
            .$defaultFn(() => createId())
            .primaryKey(),
        messageId: varchar("message_id", { length: 500 }).notNull().unique(),
        inReplyTo: varchar("in_reply_to", { length: 500 }),
        references: text("references"),

        mailboxUsername: varchar("mailbox_username", { length: 255 })
            .notNull()
            .references(() => mailbox.username, { onDelete: "cascade" }),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        fromEmail: varchar("from_email", { length: 255 }).notNull(),
        fromName: varchar("from_name", { length: 255 }),
        toEmails: jsonb("to_emails").$type<string[]>().notNull(),
        ccEmails: jsonb("cc_emails").$type<string[]>(),
        bccEmails: jsonb("bcc_emails").$type<string[]>(),
        replyTo: varchar("reply_to", { length: 255 }),
        subject: text("subject").notNull(),
        textBody: text("text_body"),
        htmlBody: text("html_body"),
        snippet: varchar("snippet", { length: 500 }),
        status: emailStatusEnum("status").notNull().default("pending"),
        priority: emailPriorityEnum("priority").notNull().default("normal"),
        folder: emailFolderEnum("folder").notNull().default("inbox"),
        isRead: boolean("is_read").notNull().default(false),
        isStarred: boolean("is_starred").notNull().default(false),
        hasAttachments: boolean("has_attachments").notNull().default(false),
        isDraft: boolean("is_draft").notNull().default(false),
        isDeleted: boolean("is_deleted").notNull().default(false),
        isSpam: boolean("is_spam").notNull().default(false),
        size: bigint("size", { mode: "number" }).notNull(),
        attachmentCount: integer("attachment_count").notNull().default(0),
        headers: jsonb("headers").$type<Record<string, string>>(),
        labels: jsonb("labels").$type<string[]>(),
        threadId: text("thread_id"),
        sentAt: timestamp("sent_at"),
        receivedAt: timestamp("received_at").notNull().defaultNow(),
        deletedAt: timestamp("deleted_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("mailbox_message_idx_mailbox_username").on(table.mailboxUsername),
        index("mailbox_message_idx_message_id").on(table.messageId),
        index("mailbox_message_idx_from_email").on(table.fromEmail),
        index("mailbox_message_idx_organization_id").on(table.organizationId),
        index("mailbox_message_idx_user_id").on(table.userId),
        index("mailbox_message_idx_status").on(table.status),
        index("mailbox_message_idx_folder").on(table.folder),
        index("mailbox_message_idx_is_read").on(table.isRead),
        index("mailbox_message_idx_is_starred").on(table.isStarred),
        index("mailbox_message_idx_is_deleted").on(table.isDeleted),
        index("mailbox_message_idx_sent_at").on(table.sentAt),
        index("mailbox_message_idx_received_at").on(table.receivedAt),
        index("mailbox_message_idx_deleted_at").on(table.deletedAt),
        index("mailbox_message_idx_thread_id").on(table.threadId),
        index("mailbox_message_idx_in_reply_to").on(table.inReplyTo),
        index("mailbox_message_idx_mailbox_folder").on(
            table.mailboxUsername,
            table.folder,
        ),
        index("mailbox_message_idx_mailbox_status").on(
            table.mailboxUsername,
            table.status,
        ),
        index("mailbox_message_idx_mailbox_received").on(
            table.mailboxUsername,
            table.receivedAt,
        ),
        index("mailbox_message_idx_from_received").on(
            table.fromEmail,
            table.receivedAt,
        ),
        index("mailbox_message_idx_folder_read").on(table.folder, table.isRead),
    ],
);

export const mailboxAttachment = pgTable(
    "mailbox_attachment",
    {
        id: text("id")
            .$defaultFn(() => createId())
            .primaryKey(),
        messageId: text("message_id")
            .notNull()
            .references(() => mailboxMessage.id, { onDelete: "cascade" }),
        filename: varchar("filename", { length: 500 }).notNull(),
        mimeType: varchar("mime_type", { length: 255 }).notNull(),
        size: bigint("size", { mode: "number" }).notNull(),
        contentId: varchar("content_id", { length: 255 }),
        storagePath: text("storage_path").notNull(),
        storageUrl: text("storage_url"),
        isInline: boolean("is_inline").notNull().default(false),
        checksum: varchar("checksum", { length: 255 }),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("mailbox_attachment_idx_message_id").on(table.messageId),
        index("mailbox_attachment_idx_filename").on(table.filename),
        index("mailbox_attachment_idx_mime_type").on(table.mimeType),
    ],
);

export const mailboxRelations = relations(mailbox, ({ one, many }) => ({
    domain: one(domain, {
        fields: [mailbox.domainId],
        references: [domain.id],
    }),
    organization: one(organization, {
        fields: [mailbox.organizationId],
        references: [organization.id],
    }),
    user: one(user, {
        fields: [mailbox.userId],
        references: [user.id],
    }),
    messages: many(mailboxMessage),
}));

export const mailboxMessageRelations = relations(
    mailboxMessage,
    ({ one, many }) => ({
        mailbox: one(mailbox, {
            fields: [mailboxMessage.mailboxUsername],
            references: [mailbox.username],
        }),
        organization: one(organization, {
            fields: [mailboxMessage.organizationId],
            references: [organization.id],
        }),
        user: one(user, {
            fields: [mailboxMessage.userId],
            references: [user.id],
        }),
        attachments: many(mailboxAttachment),
    }),
);

export const mailboxAttachmentRelations = relations(
    mailboxAttachment,
    ({ one }) => ({
        message: one(mailboxMessage, {
            fields: [mailboxAttachment.messageId],
            references: [mailboxMessage.id],
        }),
    }),
);

export const mailboxTables = {
    mailbox,
    mailboxMessage,
    mailboxAttachment,
} as const;

export type MailboxTable = typeof mailboxTables;

