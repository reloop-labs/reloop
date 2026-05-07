import { getAllRooms } from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";
import * as Y from "yjs";

export async function exportRoomController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	// 1. Try live room
	const liveRoom = getAllRooms().get(roomName);
	if (liveRoom) {
		const state = Y.encodeStateAsUpdate(liveRoom.doc);
		return {
			roomName,
			state: Buffer.from(state).toString("base64"),
			clients: liveRoom.clients.size,
			source: "live",
		};
	}

	// 2. Fall back to persisted state
	if (!persistence) {
		return "NO_PERSISTENCE" as const;
	}

	const doc = await persistence.getDoc(roomName);
	if (!doc) {
		return "NOT_FOUND" as const;
	}

	const state = Y.encodeStateAsUpdate(doc);
	return {
		roomName,
		state: Buffer.from(state).toString("base64"),
		clients: 0,
		source: "persisted",
	};
}
