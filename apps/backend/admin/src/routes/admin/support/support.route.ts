import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	createMessageController,
	getConversationController,
	getMyConversationController,
	getOrCreateMyConversationController,
	getUnreadCountController,
	listConversationsController,
	listMessagesController,
	markConversationReadController,
	updateConversationStatusController,
} from "./support.controllers";
import { supportWsRoute } from "./support.ws";

async function broadcastConversationUpdate(input: {
	conversationId: string;
	conversationForAdmin: unknown;
	conversationForUser: unknown;
	message?: unknown;
}) {
	const { broadcastToConversation, broadcastToLobby } = await import(
		"./support.rooms"
	);
	if (input.message) {
		broadcastToConversation(input.conversationId, {
			type: "message_created",
			message: input.message,
		});
		broadcastToLobby({
			type: "message_created",
			message: input.message,
		});
	}
	// Lobby (admins) get admin-perspective unread
	broadcastToLobby({
		type: "conversation_updated",
		conversation: input.conversationForAdmin,
	});
	// Conversation room gets both perspectives via a dual payload;
	// clients pick unreadCount based on their role from their own view.
	broadcastToConversation(input.conversationId, {
		type: "conversation_updated",
		conversation: input.conversationForUser,
		conversationAdmin: input.conversationForAdmin,
	});
}

export const supportRoute = new Elysia({ prefix: "/support" })
	.use(authMiddleware)
	.use(supportWsRoute)
	.get(
		"/unread-count",
		async ({ userId, isPlatformAdmin }) =>
			getUnreadCountController({ userId, isPlatformAdmin }),
		{
			supportSession: true,
			response: {
				200: AdminModel.supportUnreadCountResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Get unread support message count for current user",
			},
		},
	)
	.post(
		"/conversations",
		async ({ userId, organizationId }) => {
			const result = await getOrCreateMyConversationController({
				userId,
				organizationId,
			});
			// Only notify admin lobby when a new thread is created — never wipe
			// unread by broadcasting a user-perspective / zeroed payload.
			if (result.created) {
				const { broadcastToLobby } = await import("./support.rooms");
				broadcastToLobby({
					type: "conversation_updated",
					conversation: result.conversationForAdmin,
				});
			}
			return {
				conversation: result.conversation,
				messages: result.messages,
			};
		},
		{
			supportSession: true,
			response: {
				200: AdminModel.supportConversationWithMessages,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Get or create open support conversation for current user",
			},
		},
	)
	.get(
		"/conversations/me",
		async ({ userId }) => getMyConversationController({ userId }),
		{
			supportSession: true,
			response: {
				200: AdminModel.supportMyConversationResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Get current user's open support conversation",
			},
		},
	)
	.get(
		"/conversations",
		async ({ query }) =>
			listConversationsController({
				limit: query.limit,
				offset: query.offset,
				status: query.status,
				q: query.q,
			}),
		{
			platformAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				status: t.Optional(t.Union([t.Literal("open"), t.Literal("closed")])),
			}),
			response: {
				200: AdminModel.supportConversationsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "List support conversations (platform admin)",
			},
		},
	)
	.get(
		"/conversations/:conversationId",
		async ({ params, userId, isPlatformAdmin }) =>
			getConversationController({
				conversationId: params.conversationId,
				userId,
				isPlatformAdmin,
			}),
		{
			supportSession: true,
			params: t.Object({ conversationId: t.String() }),
			response: {
				200: AdminModel.supportConversationWithMessages,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Get support conversation with messages",
			},
		},
	)
	.get(
		"/conversations/:conversationId/messages",
		async ({ params, query, userId, isPlatformAdmin }) =>
			listMessagesController({
				conversationId: params.conversationId,
				userId,
				isPlatformAdmin,
				limit: query.limit,
				offset: query.offset,
			}),
		{
			supportSession: true,
			params: t.Object({ conversationId: t.String() }),
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
			}),
			response: {
				200: AdminModel.supportMessagesResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "List messages in a support conversation",
			},
		},
	)
	.post(
		"/conversations/:conversationId/read",
		async ({ params, userId, isPlatformAdmin }) => {
			const result = await markConversationReadController({
				conversationId: params.conversationId,
				userId,
				isPlatformAdmin,
			});
			await broadcastConversationUpdate({
				conversationId: params.conversationId,
				conversationForAdmin: result.conversationForAdmin,
				conversationForUser: result.conversationForUser,
			});
			return { conversation: result.conversation };
		},
		{
			supportSession: true,
			params: t.Object({ conversationId: t.String() }),
			response: {
				200: t.Object({
					conversation: AdminModel.supportConversation,
				}),
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Mark a support conversation as read",
			},
		},
	)
	.post(
		"/conversations/:conversationId/messages",
		async ({ params, body, userId, isPlatformAdmin }) => {
			const result = await createMessageController({
				conversationId: params.conversationId,
				senderUserId: userId,
				senderRole: isPlatformAdmin ? "admin" : "user",
				body: body.body,
				isPlatformAdmin,
			});
			await broadcastConversationUpdate({
				conversationId: params.conversationId,
				conversationForAdmin: result.conversationForAdmin,
				conversationForUser: result.conversationForUser,
				message: result.message,
			});
			return {
				message: result.message,
				conversation: result.conversation,
			};
		},
		{
			supportSession: true,
			params: t.Object({ conversationId: t.String() }),
			body: AdminModel.createSupportMessageBody,
			response: {
				200: t.Object({
					message: AdminModel.supportMessage,
					conversation: AdminModel.supportConversation,
				}),
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Send a support message (REST fallback)",
			},
		},
	)
	.patch(
		"/conversations/:conversationId",
		async ({ params, body }) => {
			const result = await updateConversationStatusController({
				conversationId: params.conversationId,
				status: body.status,
			});
			const { broadcastToConversation, broadcastToLobby } = await import(
				"./support.rooms"
			);
			const payload = {
				type: "conversation_updated" as const,
				conversation: result.conversation,
			};
			broadcastToConversation(params.conversationId, payload);
			broadcastToLobby(payload);
			return result;
		},
		{
			platformAdmin: true,
			params: t.Object({ conversationId: t.String() }),
			body: AdminModel.updateSupportStatusBody,
			response: {
				200: t.Object({
					conversation: AdminModel.supportConversation,
				}),
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Support"],
				summary: "Update support conversation status",
			},
		},
	);
