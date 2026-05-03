import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia, status, t } from "elysia";
import { deleteDocController } from "./delete-doc.controllers";

export const deleteDocRoute = new Elysia().use(persistencePlugin).delete(
  "/docs/:roomName",
  async ({ params: { roomName }, store }) => {
    const result = await deleteDocController(roomName, store.persistence);
    if (result === "NO_PERSISTENCE") return status(503, { error: "Persistence unavailable" });
    return { success: true, roomName };
  },
  {
    params: t.Object({ roomName: t.String() }),
  },
);
