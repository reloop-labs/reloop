import { authMiddleware } from "@be/template/middleware/auth";
import { templateModel } from "@be/template/model/template.model";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { exportRoomController } from "./export-room.controllers";

export const exportRoomRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.get(
		"/rooms/:roomName/export",
		async ({ params: { roomName }, organizationId, store, set }) => {
			const template = await templateModel.findByIdAndOrg(
				roomName,
				organizationId,
			);
			if (!template) {
				set.status = 404;
				return { error: `Room "${roomName}" not found` };
			}

			const result = await exportRoomController(roomName, store.persistence);

			if (result === "NOT_FOUND") {
				set.status = 404;
				return { error: `Room "${roomName}" not found` };
			}

			if (result === "NO_PERSISTENCE") {
				set.status = 503;
				return { error: "Persistence unavailable" };
			}

			return result;
		},
		{
			auth: true,
			params: t.Object({ roomName: t.String() }),
		},
	);
