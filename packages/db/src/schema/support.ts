import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

const createSupportConversationId = () => `scv_${createId()}`;
const createSupportMessageId = () => `smsg_${createId()}`;

export const supportConversationStatusEnum = pgEnum(
	"support_conversation_status",
	["open", "closed"],
);

export const supportSenderRoleEnum = pgEnum("support_sender_role", [
	"user",
	"admin",
]);

export const supportConversation = pgTable(
	"support_conversation",
	{
		id: text("id")
			.$defaultFn(() => createSupportConversationId())
			.primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		organizationId: text("organization_id").references(() => organization.id, {
			onDelete: "set null",
		}),
		status: supportConversationStatusEnum("status").notNull().default("open"),
		lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
		lastMessagePreview: text("last_message_preview"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("support_conversation_open_user_idx")
			.on(table.userId)
			.where(sql`${table.status} = 'open'`),
		index("support_conversation_user_idx").on(table.userId),
		index("support_conversation_status_idx").on(table.status),
		index("support_conversation_last_message_idx").on(table.lastMessageAt),
		index("support_conversation_org_idx").on(table.organizationId),
	],
);

export const supportMessage = pgTable(
	"support_message",
	{
		id: text("id")
			.$defaultFn(() => createSupportMessageId())
			.primaryKey(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => supportConversation.id, { onDelete: "cascade" }),
		senderUserId: text("sender_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		senderRole: supportSenderRoleEnum("sender_role").notNull(),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("support_message_conversation_idx").on(table.conversationId),
		index("support_message_created_idx").on(table.createdAt),
		index("support_message_sender_idx").on(table.senderUserId),
	],
);

export const supportConversationRelations = relations(
	supportConversation,
	({ one, many }) => ({
		user: one(user, {
			fields: [supportConversation.userId],
			references: [user.id],
		}),
		organization: one(organization, {
			fields: [supportConversation.organizationId],
			references: [organization.id],
		}),
		messages: many(supportMessage),
	}),
);

export const supportMessageRelations = relations(supportMessage, ({ one }) => ({
	conversation: one(supportConversation, {
		fields: [supportMessage.conversationId],
		references: [supportConversation.id],
	}),
	sender: one(user, {
		fields: [supportMessage.senderUserId],
		references: [user.id],
	}),
}));
