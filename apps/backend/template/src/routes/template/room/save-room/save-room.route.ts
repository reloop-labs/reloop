import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { saveRoomController } from "./save-room.controllers";

export const saveRoomRoute = new Elysia().post(
  "/rooms/:roomName/save",
  async (ctx) => {
    const { params: { roomName }, error } = ctx;
    const persistence =
      (ctx as unknown as { persistence?: YjsPersistence | null }).persistence ?? null;

    const result = await saveRoomController(roomName, persistence);

    if (result === "NOT_FOUND") {
      return error(404, { error: `Room "${roomName}" not found` });
    }

    if (result === "NO_PERSISTENCE") {
      return error(503, { error: "Persistence unavailable" });
    }

    return { success: true, roomName };
  },
  {
    params: t.Object({ roomName: t.String() }),
  },
);
