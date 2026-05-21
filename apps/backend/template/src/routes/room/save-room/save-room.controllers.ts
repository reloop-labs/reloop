import { getAllRooms } from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";

export async function saveRoomController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	const room = getAllRooms().get(roomName);

	if (!room) {
		return "NOT_FOUND" as const;
	}

	if (!persistence) {
		return "NO_PERSISTENCE" as const;
	}

	await persistence.writeState(roomName, room.doc);
	return "SUCCESS" as const;
}
