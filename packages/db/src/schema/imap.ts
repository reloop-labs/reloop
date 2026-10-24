import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	customType,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { domain } from "./domain";

// IMAP mail store. Owned by apps/backend/imap (Go): it is the only writer of
// mail_folder / mail_message, because it keeps per-folder UID state in memory.
// Other services may create accounts and app passwords directly.

const createMailAccountId = () => `macc_${createId()}`;
const createMailAppPasswordId = () => `mapw_${createId()}`;
const createMailFolderId = () => `mfld_${createId()}`;
const createMailMessageId = () => `mmsg_${createId()}`;

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return "bytea";
	},
});

export const mailAccountStatusEnum = pgEnum("mail_account_status", [
	"active",
	"disabled",
]);

// ─── mail_account ────────────────────────────────────────────────────

export const mailAccount = pgTable(
	"mail_account",
	{
		id: text("id")
			.$defaultFn(() => createMailAccountId())
			.primaryKey(),
		/** Lowercased full address; also the IMAP/SMTP login username. */
		email: varchar("email", { length: 255 }).notNull(),
		displayName: varchar("display_name", { length: 255 }),
		status: mailAccountStatusEnum("status").notNull().default("active"),
		quotaBytes: bigint("quota_bytes", { mode: "number" })
			.notNull()
			.default(5 * 1024 * 1024 * 1024),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique("mail_account_unique_email").on(table.email),
		index("mail_account_idx_organization_id").on(table.organizationId),
		index("mail_account_idx_domain_id").on(table.domainId),
	],
);

// ─── mail_app_password ───────────────────────────────────────────────

export const mailAppPassword = pgTable(
	"mail_app_password",
	{
		id: text("id")
			.$defaultFn(() => createMailAppPasswordId())
			.primaryKey(),
		accountId: text("account_id")
			.notNull()
			.references(() => mailAccount.id, { onDelete: "cascade" }),
		/** User-facing name, e.g. "Pranav's iPhone". */
		label: varchar("label", { length: 255 }).notNull(),
		/** bcrypt hash; the plain password is shown once at creation. */
		passwordHash: text("password_hash").notNull(),
		lastUsedAt: timestamp("last_used_at"),
		revokedAt: timestamp("revoked_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [index("mail_app_password_idx_account_id").on(table.accountId)],
);

// ─── mail_folder ─────────────────────────────────────────────────────

export const mailFolder = pgTable(
	"mail_folder",
	{
		id: text("id")
			.$defaultFn(() => createMailFolderId())
			.primaryKey(),
		accountId: text("account_id")
			.notNull()
			.references(() => mailAccount.id, { onDelete: "cascade" }),
		/** Full IMAP name with "/" as hierarchy delimiter; "INBOX" is special. */
		name: varchar("name", { length: 512 }).notNull(),
		/** RFC 6154 attribute such as "\\Sent"; null for user folders. */
		specialUse: varchar("special_use", { length: 32 }),
		subscribed: boolean("subscribed").notNull().default(true),
		uidValidity: bigint("uid_validity", { mode: "number" }).notNull(),
		uidNext: bigint("uid_next", { mode: "number" }).notNull().default(1),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [unique("mail_folder_unique_name").on(table.accountId, table.name)],
);

// ─── mail_message ────────────────────────────────────────────────────

export const mailMessage = pgTable(
	"mail_message",
	{
		id: text("id")
			.$defaultFn(() => createMailMessageId())
			.primaryKey(),
		accountId: text("account_id")
			.notNull()
			.references(() => mailAccount.id, { onDelete: "cascade" }),
		folderId: text("folder_id")
			.notNull()
			.references(() => mailFolder.id, { onDelete: "cascade" }),
		uid: bigint("uid", { mode: "number" }).notNull(),
		/** IMAP flags and keywords, e.g. {"\\Seen","\\Flagged","$Agent"}. */
		flags: text("flags")
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		/** IMAP INTERNALDATE: when the message entered this mailbox. */
		internalDate: timestamp("internal_date", { withTimezone: true })
			.notNull()
			.defaultNow(),
		size: bigint("size", { mode: "number" }).notNull(),
		/** Full RFC 5322 message. */
		raw: bytea("raw").notNull(),
		// Parsed header fields for the agent API; IMAP itself reads `raw`.
		messageId: text("message_id"),
		subject: text("subject"),
		fromEmail: varchar("from_email", { length: 255 }),
		sentAt: timestamp("sent_at", { withTimezone: true }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		unique("mail_message_unique_uid").on(table.folderId, table.uid),
		index("mail_message_idx_account_id").on(table.accountId),
		index("mail_message_idx_message_id").on(table.messageId),
	],
);

// ─── relations ───────────────────────────────────────────────────────

export const mailAccountRelations = relations(mailAccount, ({ one, many }) => ({
	organization: one(organization, {
		fields: [mailAccount.organizationId],
		references: [organization.id],
	}),
	domain: one(domain, {
		fields: [mailAccount.domainId],
		references: [domain.id],
	}),
	appPasswords: many(mailAppPassword),
	folders: many(mailFolder),
}));

export const mailAppPasswordRelations = relations(
	mailAppPassword,
	({ one }) => ({
		account: one(mailAccount, {
			fields: [mailAppPassword.accountId],
			references: [mailAccount.id],
		}),
	}),
);

export const mailFolderRelations = relations(mailFolder, ({ one, many }) => ({
	account: one(mailAccount, {
		fields: [mailFolder.accountId],
		references: [mailAccount.id],
	}),
	messages: many(mailMessage),
}));

export const mailMessageRelations = relations(mailMessage, ({ one }) => ({
	folder: one(mailFolder, {
		fields: [mailMessage.folderId],
		references: [mailFolder.id],
	}),
}));
