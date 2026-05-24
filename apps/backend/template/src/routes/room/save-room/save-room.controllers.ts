import { getAllRooms } from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { log } from "evlog";

export async function saveRoomController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	log.info({
		roomName,
		message: "Saving collaboration room state to persistence",
	});

	try {
		const room = getAllRooms().get(roomName);

		if (!room) {
			log.warn({
				roomName,
				message: "Collaboration room not found in live memory for saving",
			});
			return "NOT_FOUND" as const;
		}

		if (!persistence) {
			log.warn({
				roomName,
				message: "Persistence not available for saving room state",
			});
			return "NO_PERSISTENCE" as const;
		}

		await persistence.writeState(roomName, room.doc);

		log.info({
			roomName,
			message: "Successfully saved collaboration room state to persistence",
		});

		return "SUCCESS" as const;
	} catch (error) {
		log.error({
			roomName,
			message: "Error saving collaboration room state to persistence",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
