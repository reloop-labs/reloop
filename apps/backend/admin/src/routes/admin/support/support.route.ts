import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	createMessageController,
	getConversationController,
	getMyConversationController,
	getOrCreateMyConversationController,
	listConversationsController,
	listMessagesController,
	updateConversationStatusController,
} from "./support.controllers";
import { supportWsRoute } from "./support.ws";

export const supportRoute = new Elysia({ prefix: "/support" })
	.use(authMiddleware)
	.use(supportWsRoute)
	.post(
		"/conversations",
		async ({ userId, organizationId }) => {
			const result = await getOrCreateMyConversationController({
				userId,
				organizationId,
			});
			const { broadcastToLobby } = await import("./support.rooms");
			broadcastToLobby({
				type: "conversation_updated",
				conversation: result.conversation,
			});
			return result;
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
				status: t.Optional(
					t.Union([t.Literal("open"), t.Literal("closed")]),
				),
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
		"/conversations/:conversationId/messages",
		async ({ params, body, userId, isPlatformAdmin }) => {
			const result = await createMessageController({
				conversationId: params.conversationId,
				senderUserId: userId,
				senderRole: isPlatformAdmin ? "admin" : "user",
				body: body.body,
				isPlatformAdmin,
			});
			const { broadcastToConversation, broadcastToLobby } = await import(
				"./support.rooms"
			);
			broadcastToConversation(params.conversationId, {
				type: "message_created",
				message: result.message,
			});
			broadcastToConversation(params.conversationId, {
				type: "conversation_updated",
				conversation: result.conversation,
			});
			broadcastToLobby({
				type: "conversation_updated",
				conversation: result.conversation,
			});
			broadcastToLobby({
				type: "message_created",
				message: result.message,
			});
			return result;
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
