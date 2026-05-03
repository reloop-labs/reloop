import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { deleteDocController } from "./delete-doc.controllers";

export const deleteDocRoute = new Elysia().delete(
  "/docs/:roomName",
  async ({ params: { roomName }, error, ...ctx }) => {
    const persistence =
      (ctx as { persistence?: YjsPersistence | null }).persistence ?? null;

    const result = await deleteDocController(roomName, persistence);

    if (result === "NO_PERSISTENCE") {
      return error(503, { error: "Persistence unavailable" });
    }

    return { success: true, roomName };
  },
  {
    params: t.Object({ roomName: t.String() }),
  },
);
