import { db } from "@reloop/db/client";
import {
	supportConversation,
	supportMessage,
	user,
} from "@reloop/db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { createError } from "evlog";

const MESSAGE_PREVIEW_LEN = 120;
const DEFAULT_MESSAGE_LIMIT = 50;

export type SupportConversationDto = {
	id: string;
	userId: string;
	organizationId: string | null;
	status: "open" | "closed";
	lastMessageAt: Date;
	lastMessagePreview: string | null;
	createdAt: Date;
	updatedAt: Date;
	userName: string | null;
	userEmail: string | null;
};

export type SupportMessageDto = {
	id: string;
	conversationId: string;
	senderUserId: string;
	senderRole: "user" | "admin";
	body: string;
	createdAt: Date;
	senderName: string | null;
	senderEmail: string | null;
};

function previewFromBody(body: string) {
	const trimmed = body.trim();
	if (trimmed.length <= MESSAGE_PREVIEW_LEN) return trimmed;
	return `${trimmed.slice(0, MESSAGE_PREVIEW_LEN - 1)}…`;
}

function mapConversation(row: {
	id: string;
	userId: string;
	organizationId: string | null;
	status: "open" | "closed";
	lastMessageAt: Date;
	lastMessagePreview: string | null;
	createdAt: Date;
	updatedAt: Date;
	userName: string | null;
	userEmail: string | null;
}): SupportConversationDto {
	return {
		id: row.id,
		userId: row.userId,
		organizationId: row.organizationId,
		status: row.status,
		lastMessageAt: row.lastMessageAt,
		lastMessagePreview: row.lastMessagePreview,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		userName: row.userName,
		userEmail: row.userEmail,
	};
}

function mapMessage(row: {
	id: string;
	conversationId: string;
	senderUserId: string;
	senderRole: "user" | "admin";
	body: string;
	createdAt: Date;
	senderName: string | null;
	senderEmail: string | null;
}): SupportMessageDto {
	return {
		id: row.id,
		conversationId: row.conversationId,
		senderUserId: row.senderUserId,
		senderRole: row.senderRole,
		body: row.body,
		createdAt: row.createdAt,
		senderName: row.senderName,
		senderEmail: row.senderEmail,
	};
}

async function getConversationRow(conversationId: string) {
	const [row] = await db
		.select({
			id: supportConversation.id,
			userId: supportConversation.userId,
			organizationId: supportConversation.organizationId,
			status: supportConversation.status,
			lastMessageAt: supportConversation.lastMessageAt,
			lastMessagePreview: supportConversation.lastMessagePreview,
			createdAt: supportConversation.createdAt,
			updatedAt: supportConversation.updatedAt,
			userName: user.name,
			userEmail: user.email,
		})
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(eq(supportConversation.id, conversationId))
		.limit(1);
	return row ?? null;
}

async function listMessagesForConversation(
	conversationId: string,
	opts: { limit?: number; offset?: number } = {},
) {
	const limit = opts.limit ?? DEFAULT_MESSAGE_LIMIT;
	const offset = opts.offset ?? 0;

	const [totalRow] = await db
		.select({ value: count() })
		.from(supportMessage)
		.where(eq(supportMessage.conversationId, conversationId));

	const rows = await db
		.select({
			id: supportMessage.id,
			conversationId: supportMessage.conversationId,
			senderUserId: supportMessage.senderUserId,
			senderRole: supportMessage.senderRole,
			body: supportMessage.body,
			createdAt: supportMessage.createdAt,
			senderName: user.name,
			senderEmail: user.email,
		})
		.from(supportMessage)
		.innerJoin(user, eq(supportMessage.senderUserId, user.id))
		.where(eq(supportMessage.conversationId, conversationId))
		.orderBy(supportMessage.createdAt)
		.limit(limit)
		.offset(offset);

	return {
		items: rows.map(mapMessage),
		total: totalRow?.value ?? 0,
	};
}

export async function getOrCreateMyConversationController(input: {
	userId: string;
	organizationId: string | null;
}) {
	const [existing] = await db
		.select({
			id: supportConversation.id,
			userId: supportConversation.userId,
			organizationId: supportConversation.organizationId,
			status: supportConversation.status,
			lastMessageAt: supportConversation.lastMessageAt,
			lastMessagePreview: supportConversation.lastMessagePreview,
			createdAt: supportConversation.createdAt,
			updatedAt: supportConversation.updatedAt,
			userName: user.name,
			userEmail: user.email,
		})
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(
			and(
				eq(supportConversation.userId, input.userId),
				eq(supportConversation.status, "open"),
			),
		)
		.limit(1);

	if (existing) {
		const messages = await listMessagesForConversation(existing.id);
		return {
			conversation: mapConversation(existing),
			messages: messages.items,
		};
	}

	const [created] = await db
		.insert(supportConversation)
		.values({
			userId: input.userId,
			organizationId: input.organizationId,
			status: "open",
		})
		.returning();

	if (!created) {
		throw createError({
			status: 500,
			message: "Failed to create support conversation",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	const conversation = await getConversationRow(created.id);
	if (!conversation) {
		throw createError({
			status: 500,
			message: "Failed to load support conversation",
			why: "Conversation missing after insert",
			fix: "Retry the request",
		});
	}

	return {
		conversation: mapConversation(conversation),
		messages: [] as SupportMessageDto[],
	};
}

export async function getMyConversationController(input: {
	userId: string;
}) {
	const [existing] = await db
		.select({
			id: supportConversation.id,
			userId: supportConversation.userId,
			organizationId: supportConversation.organizationId,
			status: supportConversation.status,
			lastMessageAt: supportConversation.lastMessageAt,
			lastMessagePreview: supportConversation.lastMessagePreview,
			createdAt: supportConversation.createdAt,
			updatedAt: supportConversation.updatedAt,
			userName: user.name,
			userEmail: user.email,
		})
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(
			and(
				eq(supportConversation.userId, input.userId),
				eq(supportConversation.status, "open"),
			),
		)
		.limit(1);

	if (!existing) {
		return { conversation: null, messages: [] as SupportMessageDto[] };
	}

	const messages = await listMessagesForConversation(existing.id);
	return {
		conversation: mapConversation(existing),
		messages: messages.items,
	};
}

export async function listConversationsController(input: {
	limit?: number;
	offset?: number;
	status?: "open" | "closed";
	q?: string;
}) {
	const limit = input.limit ?? 50;
	const offset = input.offset ?? 0;

	const conditions = [];
	if (input.status) {
		conditions.push(eq(supportConversation.status, input.status));
	}
	if (input.q?.trim()) {
		const q = `%${input.q.trim().toLowerCase()}%`;
		conditions.push(
			sql`(lower(${user.email}) like ${q} or lower(coalesce(${user.name}, '')) like ${q})`,
		);
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(where);

	const rows = await db
		.select({
			id: supportConversation.id,
			userId: supportConversation.userId,
			organizationId: supportConversation.organizationId,
			status: supportConversation.status,
			lastMessageAt: supportConversation.lastMessageAt,
			lastMessagePreview: supportConversation.lastMessagePreview,
			createdAt: supportConversation.createdAt,
			updatedAt: supportConversation.updatedAt,
			userName: user.name,
			userEmail: user.email,
		})
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(where)
		.orderBy(desc(supportConversation.lastMessageAt))
		.limit(limit)
		.offset(offset);

	return {
		items: rows.map(mapConversation),
		total: totalRow?.value ?? 0,
	};
}

export async function getConversationController(input: {
	conversationId: string;
	userId: string;
	isPlatformAdmin: boolean;
}) {
	const conversation = await getConversationRow(input.conversationId);
	if (!conversation) {
		throw createError({
			status: 404,
			message: "Conversation not found",
			why: "No support conversation exists with that id",
			fix: "Refresh the conversation list",
		});
	}

	if (!input.isPlatformAdmin && conversation.userId !== input.userId) {
		throw createError({
			status: 403,
			message: "Forbidden",
			why: "You can only access your own support conversations",
			fix: "Open support from your account",
		});
	}

	const messages = await listMessagesForConversation(conversation.id);
	return {
		conversation: mapConversation(conversation),
		messages: messages.items,
	};
}

export async function listMessagesController(input: {
	conversationId: string;
	userId: string;
	isPlatformAdmin: boolean;
	limit?: number;
	offset?: number;
}) {
	const conversation = await getConversationRow(input.conversationId);
	if (!conversation) {
		throw createError({
			status: 404,
			message: "Conversation not found",
			why: "No support conversation exists with that id",
			fix: "Refresh the conversation list",
		});
	}

	if (!input.isPlatformAdmin && conversation.userId !== input.userId) {
		throw createError({
			status: 403,
			message: "Forbidden",
			why: "You can only access your own support conversations",
			fix: "Open support from your account",
		});
	}

	return listMessagesForConversation(conversation.id, {
		limit: input.limit,
		offset: input.offset,
	});
}

export async function updateConversationStatusController(input: {
	conversationId: string;
	status: "open" | "closed";
}) {
	const conversation = await getConversationRow(input.conversationId);
	if (!conversation) {
		throw createError({
			status: 404,
			message: "Conversation not found",
			why: "No support conversation exists with that id",
			fix: "Refresh the conversation list",
		});
	}

	if (input.status === "open" && conversation.status === "closed") {
		const [openExisting] = await db
			.select({ id: supportConversation.id })
			.from(supportConversation)
			.where(
				and(
					eq(supportConversation.userId, conversation.userId),
					eq(supportConversation.status, "open"),
				),
			)
			.limit(1);

		if (openExisting && openExisting.id !== conversation.id) {
			throw createError({
			status: 409,
			message: "User already has an open conversation",
			why: "Only one open support conversation is allowed per user",
			fix: "Close the other open conversation first",
		});
		}
	}

	const now = new Date();
	await db
		.update(supportConversation)
		.set({ status: input.status, updatedAt: now })
		.where(eq(supportConversation.id, input.conversationId));

	const updated = await getConversationRow(input.conversationId);
	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to update conversation",
			why: "Conversation missing after update",
			fix: "Retry the request",
		});
	}

	return { conversation: mapConversation(updated) };
}

export async function createMessageController(input: {
	conversationId: string;
	senderUserId: string;
	senderRole: "user" | "admin";
	body: string;
	isPlatformAdmin: boolean;
}) {
	const trimmed = input.body.trim();
	if (!trimmed) {
		throw createError({
			status: 400,
			message: "Message body is required",
			why: "Empty messages are not allowed",
			fix: "Type a message before sending",
		});
	}
	if (trimmed.length > 4000) {
		throw createError({
			status: 400,
			message: "Message too long",
			why: "Messages are limited to 4000 characters",
			fix: "Shorten your message and retry",
		});
	}

	const conversation = await getConversationRow(input.conversationId);
	if (!conversation) {
		throw createError({
			status: 404,
			message: "Conversation not found",
			why: "No support conversation exists with that id",
			fix: "Refresh the conversation list",
		});
	}

	if (!input.isPlatformAdmin && conversation.userId !== input.senderUserId) {
		throw createError({
			status: 403,
			message: "Forbidden",
			why: "You can only send messages in your own conversations",
			fix: "Open support from your account",
		});
	}

	if (conversation.status === "closed") {
		throw createError({
			status: 409,
			message: "Conversation is closed",
			why: "Messages cannot be sent to a closed conversation",
			fix: "Reopen the conversation or start a new one",
		});
	}

	const now = new Date();
	const [inserted] = await db
		.insert(supportMessage)
		.values({
			conversationId: conversation.id,
			senderUserId: input.senderUserId,
			senderRole: input.senderRole,
			body: trimmed,
			createdAt: now,
		})
		.returning();

	if (!inserted) {
		throw createError({
			status: 500,
			message: "Failed to send message",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	await db
		.update(supportConversation)
		.set({
			lastMessageAt: now,
			lastMessagePreview: previewFromBody(trimmed),
			updatedAt: now,
		})
		.where(eq(supportConversation.id, conversation.id));

	const [sender] = await db
		.select({ name: user.name, email: user.email })
		.from(user)
		.where(eq(user.id, input.senderUserId))
		.limit(1);

	const message = mapMessage({
		id: inserted.id,
		conversationId: inserted.conversationId,
		senderUserId: inserted.senderUserId,
		senderRole: inserted.senderRole,
		body: inserted.body,
		createdAt: inserted.createdAt,
		senderName: sender?.name ?? null,
		senderEmail: sender?.email ?? null,
	});

	const updatedConversation = await getConversationRow(conversation.id);

	return {
		message,
		conversation: updatedConversation
			? mapConversation(updatedConversation)
			: mapConversation(conversation),
	};
}

export async function assertConversationAccess(input: {
	conversationId: string;
	userId: string;
	isPlatformAdmin: boolean;
}) {
	const conversation = await getConversationRow(input.conversationId);
	if (!conversation) return null;
	if (!input.isPlatformAdmin && conversation.userId !== input.userId) {
		return null;
	}
	return mapConversation(conversation);
}
