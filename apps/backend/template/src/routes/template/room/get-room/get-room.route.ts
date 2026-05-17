import { Elysia, t } from "elysia";
import { getRoomController } from "./get-room.controllers";

export const getRoomRoute = new Elysia().get(
	"/rooms/:roomName",
	({ params: { roomName }, set }) => {
		const roomInfo = getRoomController(roomName);
		if (!roomInfo) {
			set.status = 404;
			return { error: `Room "${roomName}" not found` };
		}
		return roomInfo;
	},
	{
		params: t.Object({ roomName: t.String() }),
	},
);
