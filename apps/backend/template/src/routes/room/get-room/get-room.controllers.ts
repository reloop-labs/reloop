import { getAllRooms } from "@be/template/plugins/room";

export function getRoomController(roomName: string) {
	const room = getAllRooms().get(roomName);

	if (!room) {
		return null;
	}

	return {
		name: roomName,
		clients: room.clients.size,
		lastActivity: new Date(room.lastActivity).toISOString(),
	};
}
