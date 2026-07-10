import { createId } from "@paralleldrive/cuid2";
import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import {
	assertConversationAccess,
	createMessageController,
} from "./support.controllers";
import {
	broadcastToConversation,
	broadcastToLobby,
	joinConversationRoom,
	joinLobby,
	leaveConversationRoom,
	leaveLobby,
	removeClient,
	sendToClient,
	type SupportWsClient,
} from "./support.rooms";

type ClientMessage =
	| { type: "join"; conversationId: string }
	| { type: "leave"; conversationId: string }
	| { type: "send"; conversationId: string; body: string }
	| { type: "join_lobby" }
	| { type: "leave_lobby" };

const clientsByWs = new WeakMap<object, SupportWsClient>();

function parseClientMessage(raw: string | unknown): ClientMessage | null {
	try {
		const data =
			typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
		if (!data || typeof data !== "object") return null;
		const msg = data as Record<string, unknown>;
		if (msg.type === "join" && typeof msg.conversationId === "string") {
			return { type: "join", conversationId: msg.conversationId };
		}
		if (msg.type === "leave" && typeof msg.conversationId === "string") {
			return { type: "leave", conversationId: msg.conversationId };
		}
		if (
			msg.type === "send" &&
			typeof msg.conversationId === "string" &&
			typeof msg.body === "string"
		) {
			return {
				type: "send",
				conversationId: msg.conversationId,
				body: msg.body,
			};
		}
		if (msg.type === "join_lobby") return { type: "join_lobby" };
		if (msg.type === "leave_lobby") return { type: "leave_lobby" };
		return null;
	} catch {
		return null;
	}
}

function getOrCreateClient(ws: {
	readyState: number;
	send: (data: string | Buffer | Uint8Array) => unknown;
}): SupportWsClient {
	const existing = clientsByWs.get(ws);
	if (existing) {
		existing.readyState = ws.readyState;
		return existing;
	}
	const client: SupportWsClient = {
		id: createId(),
		readyState: ws.readyState,
		send: (data: string) => {
			ws.send(data);
		},
		joinedConversations: new Set(),
		inLobby: false,
	};
	clientsByWs.set(ws, client);
	return client;
}

export const supportWsRoute = new Elysia()
	.use(authMiddleware)
	.ws("/ws", {
		supportSession: true,
		body: t.Unknown(),
		async open(ws) {
			const userId = ws.data.userId as string | undefined;
			const isPlatformAdmin = Boolean(ws.data.isPlatformAdmin);
			const client = getOrCreateClient(ws);

			if (!userId) {
				sendToClient(client, { type: "error", message: "Unauthorized" });
				ws.close(1008, "Unauthorized");
				return;
			}

			client.userId = userId;
			client.isPlatformAdmin = isPlatformAdmin;
			client.readyState = ws.readyState;

			if (isPlatformAdmin) {
				joinLobby(client);
			}

			sendToClient(client, {
				type: "ready",
				userId,
				isPlatformAdmin,
			});

			log.info({
				message: "[support-ws] Client connected",
				userId,
				isPlatformAdmin,
			});
		},
		async message(ws, message) {
			const client = getOrCreateClient(ws);
			client.readyState = ws.readyState;

			// Prefer session resolved on upgrade; fall back to ws.data from macro
			const userId =
				client.userId ?? (ws.data.userId as string | undefined);
			const isPlatformAdmin = Boolean(
				client.isPlatformAdmin ?? ws.data.isPlatformAdmin,
			);
			if (userId) client.userId = userId;
			client.isPlatformAdmin = isPlatformAdmin;

			if (!userId) {
				sendToClient(client, { type: "error", message: "Unauthorized" });
				return;
			}

			const parsed = parseClientMessage(message);
			if (!parsed) {
				sendToClient(client, { type: "error", message: "Invalid message" });
				return;
			}

			if (parsed.type === "join_lobby") {
				if (!isPlatformAdmin) {
					sendToClient(client, {
						type: "error",
						message: "Admin privileges required for lobby",
					});
					return;
				}
				joinLobby(client);
				sendToClient(client, { type: "lobby_joined" });
				return;
			}

			if (parsed.type === "leave_lobby") {
				leaveLobby(client);
				sendToClient(client, { type: "lobby_left" });
				return;
			}

			if (parsed.type === "join") {
				const conversation = await assertConversationAccess({
					conversationId: parsed.conversationId,
					userId,
					isPlatformAdmin,
				});
				if (!conversation) {
					sendToClient(client, {
						type: "error",
						message: "Conversation not found or access denied",
					});
					return;
				}
				joinConversationRoom(parsed.conversationId, client);
				sendToClient(client, {
					type: "joined",
					conversationId: parsed.conversationId,
				});
				return;
			}

			if (parsed.type === "leave") {
				leaveConversationRoom(parsed.conversationId, client);
				sendToClient(client, {
					type: "left",
					conversationId: parsed.conversationId,
				});
				return;
			}

			if (parsed.type === "send") {
				try {
					const result = await createMessageController({
						conversationId: parsed.conversationId,
						senderUserId: userId,
						senderRole: isPlatformAdmin ? "admin" : "user",
						body: parsed.body,
						isPlatformAdmin,
					});

					const messagePayload = {
						type: "message_created" as const,
						message: result.message,
					};
					const conversationPayload = {
						type: "conversation_updated" as const,
						conversation: result.conversation,
					};

					broadcastToConversation(parsed.conversationId, messagePayload);
					broadcastToConversation(parsed.conversationId, conversationPayload);
					broadcastToLobby(conversationPayload);
					broadcastToLobby(messagePayload);
				} catch (error) {
					const errMessage =
						error &&
						typeof error === "object" &&
						"message" in error &&
						typeof (error as { message: unknown }).message === "string"
							? (error as { message: string }).message
							: "Failed to send message";
					sendToClient(client, { type: "error", message: errMessage });
				}
			}
		},
		close(ws) {
			const client = clientsByWs.get(ws);
			if (client) {
				removeClient(client);
				clientsByWs.delete(ws);
			}
			log.info({
				message: "[support-ws] Client disconnected",
				userId: client?.userId,
			});
		},
	});
