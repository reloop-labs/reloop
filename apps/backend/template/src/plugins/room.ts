import { logger } from "@reloop/logger";
import * as encoding from "lib0/encoding";
import * as map from "lib0/map";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as Y from "yjs";

// ── Message type constants (y-websocket protocol) ──────────────────────────
export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;
export const MESSAGE_USER_INFO = 2;

export interface CollabClient {
	readyState: number;
	send(message: Uint8Array): void | number;
}

// ── Room type ──────────────────────────────────────────────────────────────
export interface Room {
	doc: Y.Doc;
	awareness: awarenessProtocol.Awareness;
	clients: Set<CollabClient>;
	lastActivity: number;
}

// ── In-memory room registry ────────────────────────────────────────────────
export const rooms = new Map<string, Room>();
export const clientIdsMap = new WeakMap<CollabClient, Set<number>>();

export const getRoom = (roomName: string): Room => {
	return map.setIfUndefined(rooms, roomName, () => {
		const doc = new Y.Doc();
		const awareness = new awarenessProtocol.Awareness(doc);

		// Broadcast document updates to all connected clients
		doc.on("update", (update: Uint8Array, origin: any) => {
			const encoder = encoding.createEncoder();
			encoding.writeVarUint(encoder, MESSAGE_SYNC);
			syncProtocol.writeUpdate(encoder, update);
			const message = encoding.toUint8Array(encoder);

			const room = rooms.get(roomName);
			if (!room) return;

			room.clients.forEach((client) => {
				// Don't send the update back to the client that originated it
				if (client !== origin && client.readyState === 1) {
					client.send(message);
				}
			});
		});

		// When any client's awareness changes (cursor, presence),
		// broadcast the update to every other client in the room
		awareness.on(
			"update",
			(
				{
					added,
					updated,
					removed,
				}: {
					added: number[];
					updated: number[];
					removed: number[];
				},
				origin: unknown,
			) => {
				if (origin && typeof origin === "object" && "send" in origin) {
					const client = origin as CollabClient;
					let cids = clientIdsMap.get(client);
					if (!cids) {
						cids = new Set();
						clientIdsMap.set(client, cids);
					}
					for (const id of added) {
						cids.add(id);
					}
				}

				const changedClients = [...added, ...updated, ...removed];
				const room = rooms.get(roomName);
				if (!room) return;

				const encoder = encoding.createEncoder();
				encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
				encoding.writeVarUint8Array(
					encoder,
					awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients),
				);
				const message = encoding.toUint8Array(encoder);

				room.clients.forEach((client) => {
					if (client !== origin && client.readyState === 1) {
						client.send(message);
					}
				});
			},
		);

		return {
			doc,
			awareness,
			clients: new Set(),
			lastActivity: Date.now(),
		};
	});
};

export const getAllRooms = () => rooms;

/** Reverse-lookup room name from room object */
export function getRoomName(room: Room): string | undefined {
	for (const [name, r] of rooms.entries()) {
		if (r === room) return name;
	}
	return undefined;
}

/** Schedule room cleanup after inactivity */
export function scheduleRoomCleanup(roomName: string) {
	setTimeout(
		() => {
			const room = rooms.get(roomName);
			if (room && room.clients.size === 0) {
				room.doc.destroy();
				rooms.delete(roomName);
				logger.info({ roomName }, "[collab] Room destroyed (inactive)");
			}
		},
		30 * 1000, // 30 seconds
	);
}
