import { authMiddleware } from "@be/template/middleware/auth";
import { templateModel } from "@be/template/model/template.model";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia, status, t } from "elysia";
import { deleteDocController } from "./delete-doc.controllers";

export const deleteDocRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.delete(
		"/docs/:roomName",
		async ({ params: { roomName }, organizationId, store, set }) => {
			const template = await templateModel.findByIdAndOrg(
				roomName,
				organizationId,
			);
			if (!template) {
				set.status = 404;
				return { error: `Room "${roomName}" not found` };
			}

			const result = await deleteDocController(roomName, store.persistence);
			if (result === "NO_PERSISTENCE")
				return status(503, { error: "Persistence unavailable" });
			return { success: true, roomName };
		},
		{
			auth: true,
			params: t.Object({ roomName: t.String() }),
		},
	);
