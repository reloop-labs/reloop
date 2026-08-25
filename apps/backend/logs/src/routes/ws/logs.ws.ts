import { createId } from "@paralleldrive/cuid2";
import { authMiddleware } from "@reloop/logs/middleware/auth";
import {
	joinOrgRoom,
	type LogsWsClient,
	removeClient,
	sendToClient,
} from "@reloop/logs/rooms/logs.rooms";
import { Elysia, t } from "elysia";
import { log } from "evlog";

type ClientMessage = { type: "ping" };

const clientsByWs = new WeakMap<object, LogsWsClient>();

function parseClientMessage(raw: string | unknown): ClientMessage | null {
	try {
		const data = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
		if (!data || typeof data !== "object") return null;
		const msg = data as Record<string, unknown>;
		if (msg.type === "ping") return { type: "ping" };
		return null;
	} catch {
		return null;
	}
}

function getOrCreateClient(ws: {
	readyState: number;
	send: (data: string | Buffer | Uint8Array) => unknown;
}): LogsWsClient {
	const existing = clientsByWs.get(ws);
	if (existing) {
		existing.readyState = ws.readyState;
		return existing;
	}
	const client: LogsWsClient = {
		id: createId(),
		readyState: ws.readyState,
		send: (data: string) => {
			ws.send(data);
		},
	};
	clientsByWs.set(ws, client);
	return client;
}

export const logsWsRoute = new Elysia({ prefix: "/v1" })
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

			log.info(
				"logs-ws",
				`Client connected for org: ${organizationId} (user: ${userId})`,
			);
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
			}
		},
		close(ws) {
			const client = clientsByWs.get(ws);
			if (client) {
				removeClient(client);
				clientsByWs.delete(ws);
			}
			log.info("logs-ws", `Client disconnected (user: ${client?.userId})`);
		},
	});
