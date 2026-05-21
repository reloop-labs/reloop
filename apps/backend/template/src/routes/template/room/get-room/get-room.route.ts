import { authMiddleware } from "@be/template/middleware/auth";
import { templateModel } from "@be/template/model/template.model";
import { Elysia, t } from "elysia";
import { getRoomController } from "./get-room.controllers";

export const getRoomRoute = new Elysia().use(authMiddleware).get(
	"/rooms/:roomName",
	async ({ params: { roomName }, organizationId, set }) => {
		const template = await templateModel.findByIdAndOrg(
			roomName,
			organizationId,
		);
		if (!template) {
			set.status = 404;
			return { error: `Room "${roomName}" not found` };
		}

		const roomInfo = getRoomController(roomName);
		if (!roomInfo) {
			set.status = 404;
			return { error: `Room "${roomName}" not found` };
		}
		return roomInfo;
	},
	{
		auth: true,
		params: t.Object({ roomName: t.String() }),
	},
);
