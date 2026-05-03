import { getAllRooms } from "@be/template/plugins/room";

export function listRoomsController() {
  const rooms = getAllRooms();

  return {
    rooms: Array.from(rooms.entries()).map(([name, room]) => ({
      name,
      clients: room.clients.size,
      lastActivity: new Date(room.lastActivity).toISOString(),
    })),
  };
}
