import { getAllRooms } from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { log } from "evlog";
import * as Y from "yjs";

export async function exportRoomController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	log.info({
		roomName,
		message: "Exporting collaboration room state",
	});

	try {
		// 1. Try live room
		const liveRoom = getAllRooms().get(roomName);
		if (liveRoom) {
			const state = Y.encodeStateAsUpdate(liveRoom.doc);
			log.info({
				roomName,
				source: "live",
				message: "Exporting room state from live memory",
			});
			return {
				roomName,
				state: Buffer.from(state).toString("base64"),
				clients: liveRoom.clients.size,
				source: "live" as const,
			};
		}

		// 2. Fall back to persisted state
		if (!persistence) {
			log.warn({
				roomName,
				message: "Persistence not available for exporting room state",
			});
			return "NO_PERSISTENCE" as const;
		}

		const doc = await persistence.getDoc(roomName);
		if (!doc) {
			log.info({
				roomName,
				message: "Collaboration room state not found in persistence",
			});
			return "NOT_FOUND" as const;
		}

		const state = Y.encodeStateAsUpdate(doc);
		log.info({
			roomName,
			source: "persisted",
			message: "Exporting room state from persistence",
		});
		return {
			roomName,
			state: Buffer.from(state).toString("base64"),
			clients: 0,
			source: "persisted" as const,
		};
	} catch (error) {
		log.error({
			roomName,
			message: "Error exporting collaboration room state",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
