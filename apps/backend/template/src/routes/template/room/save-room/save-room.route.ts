import { authMiddleware } from "@be/template/middleware/auth";
import { templateModel } from "@be/template/model/template.model";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { saveRoomController } from "./save-room.controllers";

export const saveRoomRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.post(
		"/rooms/:roomName/save",
		async ({ params: { roomName }, organizationId, store, set }) => {
			const template = await templateModel.findByIdAndOrg(
				roomName,
				organizationId,
			);
			if (!template) {
				set.status = 404;
				return { error: `Room "${roomName}" not found` };
			}

			const result = await saveRoomController(roomName, store.persistence);

			if (result === "NOT_FOUND") {
				set.status = 404;
				return { error: `Room "${roomName}" not found` };
			}

			if (result === "NO_PERSISTENCE") {
				set.status = 503;
				return { error: "Persistence unavailable" };
			}

			return { success: true, roomName };
		},
		{
			auth: true,
			params: t.Object({ roomName: t.String() }),
		},
	);
