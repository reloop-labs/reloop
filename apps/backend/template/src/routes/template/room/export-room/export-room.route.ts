import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { exportRoomController } from "./export-room.controllers";

export const exportRoomRoute = new Elysia().get(
  "/rooms/:roomName/export",
  async ({ params: { roomName }, error, ...ctx }) => {
    const persistence =
      (ctx as { persistence?: YjsPersistence | null }).persistence ?? null;

    const result = await exportRoomController(roomName, persistence);

    if (result === "NOT_FOUND") {
      return error(404, { error: `Room "${roomName}" not found` });
    }

    if (result === "NO_PERSISTENCE") {
      return error(503, { error: "Persistence unavailable" });
    }

    return result;
  },
  {
    params: t.Object({ roomName: t.String() }),
  },
);
