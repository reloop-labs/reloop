import { createId } from "@paralleldrive/cuid2";
import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import {
	type InboxWsClient,
	joinOrgRoom,
	removeClient,
	sendToClient,
	subscribeMailbox,
	unsubscribeMailbox,
} from "../../rooms/inbox.rooms";

type ClientMessage =
	| { type: "subscribe_mailbox"; mailboxId: string }
	| { type: "unsubscribe_mailbox"; mailboxId: string }
	| { type: "ping" };

const clientsByWs = new WeakMap<object, InboxWsClient>();

function parseClientMessage(raw: string | unknown): ClientMessage | null {
	try {
		const data = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
		if (!data || typeof data !== "object") return null;
		const msg = data as Record<string, unknown>;

		if (
			(msg.type === "subscribe_mailbox" || msg.type === "join_mailbox") &&
			typeof msg.mailboxId === "string"
		) {
			return { type: "subscribe_mailbox", mailboxId: msg.mailboxId };
		}

		if (
			(msg.type === "unsubscribe_mailbox" || msg.type === "leave_mailbox") &&
			typeof msg.mailboxId === "string"
		) {
			return { type: "unsubscribe_mailbox", mailboxId: msg.mailboxId };
		}

		if (msg.type === "ping") {
			return { type: "ping" };
		}

		return null;
	} catch {
		return null;
	}
}

function getOrCreateClient(ws: {
	readyState: number;
	send: (data: string | Buffer | Uint8Array) => unknown;
}): InboxWsClient {
	const existing = clientsByWs.get(ws);
	if (existing) {
		existing.readyState = ws.readyState;
		return existing;
	}
	const client: InboxWsClient = {
		id: createId(),
		readyState: ws.readyState,
		send: (data: string) => {
			ws.send(data);
		},
		subscribedMailboxes: new Set(),
	};
	clientsByWs.set(ws, client);
	return client;
}

export const inboxWsRoute = new Elysia({ prefix: "/v1" })
	.use(authMiddleware)
	.ws("/ws", {
		auth: true,
		body: t.Unknown(),
		async open(ws) {
			const userId = ws.data.userId as string | undefined;
			const organizationId = ws.data.organizationId as string | undefined;
			const client = getOrCreateClient(ws);

			if (!userId || !organizationId) {
				sendToClient(client, { type: "error", message: "Unauthorized" });
				ws.close(1008, "Unauthorized");
				return;
			}

			client.userId = userId;
			client.organizationId = organizationId;
			client.readyState = ws.readyState;

			joinOrgRoom(organizationId, client);

			sendToClient(client, {
				type: "ready",
				userId,
				organizationId,
			});

			log.info("inbox-ws", `Client connected for org: ${organizationId} (user: ${userId})`);
		},
		async message(ws, message) {
			const client = getOrCreateClient(ws);
			client.readyState = ws.readyState;

			const userId = client.userId ?? (ws.data.userId as string | undefined);
			const organizationId =
				client.organizationId ?? (ws.data.organizationId as string | undefined);

			if (!userId || !organizationId) {
				sendToClient(client, { type: "error", message: "Unauthorized" });
				return;
			}

			const parsed = parseClientMessage(message);
			if (!parsed) {
				sendToClient(client, { type: "error", message: "Invalid message" });
				return;
			}

			if (parsed.type === "ping") {
				sendToClient(client, { type: "pong" });
				return;
			}

			if (parsed.type === "subscribe_mailbox") {
				subscribeMailbox(client, parsed.mailboxId);
				sendToClient(client, {
					type: "mailbox_subscribed",
					mailboxId: parsed.mailboxId,
				});
				return;
			}

			if (parsed.type === "unsubscribe_mailbox") {
				unsubscribeMailbox(client, parsed.mailboxId);
				sendToClient(client, {
					type: "mailbox_unsubscribed",
					mailboxId: parsed.mailboxId,
				});
				return;
			}
		},
		close(ws) {
			const client = clientsByWs.get(ws);
			if (client) {
				removeClient(client);
				clientsByWs.delete(ws);
			}
			log.info("inbox-ws", `Client disconnected (user: ${client?.userId})`);
		},
	});
