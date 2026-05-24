import { getAllRooms } from "@be/template/plugins/room";
import { log } from "evlog";

export function getRoomController(roomName: string) {
	log.info({
		roomName,
		message: "Retrieving collaboration room details",
	});

	try {
		const room = getAllRooms().get(roomName);

		if (!room) {
			log.info({
				roomName,
				message: "Collaboration room not found in live memory",
			});
			return null;
		}

		log.info({
			roomName,
			clients: room.clients.size,
			message: "Successfully retrieved collaboration room details",
		});

		return {
			name: roomName,
			clients: room.clients.size,
			lastActivity: new Date(room.lastActivity).toISOString(),
		};
	} catch (error) {
		log.error({
			roomName,
			message: "Error retrieving collaboration room details",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
