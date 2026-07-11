import { db } from "@reloop/db/client";
import { supportConversation, supportMessage, user } from "@reloop/db/schema";
import { and, count, desc, eq, gt, sql } from "drizzle-orm";
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
	userImage: string | null;
	userLastReadAt: Date | null;
	adminLastReadAt: Date | null;
	unreadCount: number;
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
	senderImage: string | null;
};

type ConversationRow = {
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
	userImage: string | null;
	userLastReadAt: Date | null;
	adminLastReadAt: Date | null;
};

function previewFromBody(body: string) {
	const trimmed = body.trim();
	if (trimmed.length <= MESSAGE_PREVIEW_LEN) return trimmed;
	return `${trimmed.slice(0, MESSAGE_PREVIEW_LEN - 1)}…`;
}

const conversationSelect = {
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
	userImage: user.image,
	userLastReadAt: supportConversation.userLastReadAt,
	adminLastReadAt: supportConversation.adminLastReadAt,
};

async function countUnreadForConversation(
	conversationId: string,
	isPlatformAdmin: boolean,
	lastReadAt: Date | null,
): Promise<number> {
	const role = isPlatformAdmin ? "user" : "admin";
	const conditions = [
		eq(supportMessage.conversationId, conversationId),
		eq(supportMessage.senderRole, role),
	];
	if (lastReadAt) {
		conditions.push(gt(supportMessage.createdAt, lastReadAt));
	}
	const [row] = await db
		.select({ value: count() })
		.from(supportMessage)
		.where(and(...conditions));
	return row?.value ?? 0;
}

async function mapConversation(
	row: ConversationRow,
	isPlatformAdmin: boolean,
): Promise<SupportConversationDto> {
	const lastReadAt = isPlatformAdmin ? row.adminLastReadAt : row.userLastReadAt;
	const unreadCount = await countUnreadForConversation(
		row.id,
		isPlatformAdmin,
		lastReadAt,
	);
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
		userImage: row.userImage,
		userLastReadAt: row.userLastReadAt,
		adminLastReadAt: row.adminLastReadAt,
		unreadCount,
	};
}

async function mapConversations(
	rows: ConversationRow[],
	isPlatformAdmin: boolean,
): Promise<SupportConversationDto[]> {
	return Promise.all(rows.map((row) => mapConversation(row, isPlatformAdmin)));
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
	senderImage: string | null;
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
		senderImage: row.senderImage,
	};
}

async function getConversationRow(conversationId: string) {
	const [row] = await db
		.select(conversationSelect)
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
			senderImage: user.image,
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
		.select(conversationSelect)
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
			conversation: await mapConversation(existing, false),
			conversationForAdmin: await mapConversation(existing, true),
			messages: messages.items,
			created: false as const,
		};
	}

	const now = new Date();
	const [created] = await db
		.insert(supportConversation)
		.values({
			userId: input.userId,
			organizationId: input.organizationId,
			status: "open",
			userLastReadAt: now,
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
		conversation: await mapConversation(conversation, false),
		conversationForAdmin: await mapConversation(conversation, true),
		messages: [] as SupportMessageDto[],
		created: true as const,
	};
}

export async function getMyConversationController(input: { userId: string }) {
	const [existing] = await db
		.select(conversationSelect)
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
		conversation: await mapConversation(existing, false),
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
		.select(conversationSelect)
		.from(supportConversation)
		.innerJoin(user, eq(supportConversation.userId, user.id))
		.where(where)
		.orderBy(desc(supportConversation.lastMessageAt))
		.limit(limit)
		.offset(offset);

	return {
		items: await mapConversations(rows, true),
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
		conversation: await mapConversation(conversation, input.isPlatformAdmin),
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

	return { conversation: await mapConversation(updated, true) };
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

	// Sender has read up through their own message
	const readUpdate = input.isPlatformAdmin
		? { adminLastReadAt: now }
		: { userLastReadAt: now };

	await db
		.update(supportConversation)
		.set({
			lastMessageAt: now,
			lastMessagePreview: previewFromBody(trimmed),
			updatedAt: now,
			...readUpdate,
		})
		.where(eq(supportConversation.id, conversation.id));

	const [sender] = await db
		.select({ name: user.name, email: user.email, image: user.image })
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
		senderImage: sender?.image ?? null,
	});

	const updatedConversation = await getConversationRow(conversation.id);
	const mapped = updatedConversation
		? await mapConversation(updatedConversation, input.isPlatformAdmin)
		: await mapConversation(conversation, input.isPlatformAdmin);

	// For broadcasts, also compute the other party's unread view
	const forAdmin = updatedConversation
		? await mapConversation(updatedConversation, true)
		: mapped;
	const forUser = updatedConversation
		? await mapConversation(updatedConversation, false)
		: mapped;

	return {
		message,
		conversation: mapped,
		conversationForAdmin: forAdmin,
		conversationForUser: forUser,
	};
}

export async function markConversationReadController(input: {
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
			why: "You can only mark your own conversations as read",
			fix: "Open support from your account",
		});
	}

	const now = new Date();
	await db
		.update(supportConversation)
		.set(
			input.isPlatformAdmin
				? { adminLastReadAt: now, updatedAt: now }
				: { userLastReadAt: now, updatedAt: now },
		)
		.where(eq(supportConversation.id, input.conversationId));

	const updated = await getConversationRow(input.conversationId);
	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to mark conversation as read",
			why: "Conversation missing after update",
			fix: "Retry the request",
		});
	}

	return {
		conversation: await mapConversation(updated, input.isPlatformAdmin),
		conversationForAdmin: await mapConversation(updated, true),
		conversationForUser: await mapConversation(updated, false),
	};
}

export async function getUnreadCountController(input: {
	userId: string;
	isPlatformAdmin: boolean;
}) {
	if (input.isPlatformAdmin) {
		const [row] = await db
			.select({
				value: sql<number>`coalesce(sum(
					(select count(*)::int from ${supportMessage}
					 where ${supportMessage.conversationId} = ${supportConversation.id}
					   and ${supportMessage.senderRole} = 'user'
					   and (
					     ${supportConversation.adminLastReadAt} is null
					     or ${supportMessage.createdAt} > ${supportConversation.adminLastReadAt}
					   )
					)
				), 0)`,
			})
			.from(supportConversation)
			.where(eq(supportConversation.status, "open"));
		return { count: Number(row?.value ?? 0) };
	}

	const [open] = await db
		.select({
			id: supportConversation.id,
			userLastReadAt: supportConversation.userLastReadAt,
		})
		.from(supportConversation)
		.where(
			and(
				eq(supportConversation.userId, input.userId),
				eq(supportConversation.status, "open"),
			),
		)
		.limit(1);

	if (!open) return { count: 0 };

	const unread = await countUnreadForConversation(
		open.id,
		false,
		open.userLastReadAt,
	);
	return { count: unread };
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
	return mapConversation(conversation, input.isPlatformAdmin);
}
