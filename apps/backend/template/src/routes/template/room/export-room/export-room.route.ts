import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { exportRoomController } from "./export-room.controllers";

export const exportRoomRoute = new Elysia().get(
	"/rooms/:roomName/export",
	async (ctx) => {
		const {
			params: { roomName },
		} = ctx;
		const persistence =
			(ctx as unknown as { persistence?: YjsPersistence | null }).persistence ??
			null;

		const result = await exportRoomController(roomName, persistence);

		if (result === "NOT_FOUND") {
			ctx.set.status = 404;
			return { error: `Room "${roomName}" not found` };
		}

		if (result === "NO_PERSISTENCE") {
			ctx.set.status = 503;
			return { error: "Persistence unavailable" };
		}

		return result;
	},
	{
		params: t.Object({ roomName: t.String() }),
	},
);
