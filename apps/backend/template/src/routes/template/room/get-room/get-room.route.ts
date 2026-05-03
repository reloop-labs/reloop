import { Elysia, t } from "elysia";
import { getRoomController } from "./get-room.controllers";

export const getRoomRoute = new Elysia().get(
  "/rooms/:roomName",
  ({ params: { roomName }, error }) => {
    const roomInfo = getRoomController(roomName);
    if (!roomInfo) {
      return error(404, { error: `Room "${roomName}" not found` });
    }
    return roomInfo;
  },
  {
    params: t.Object({ roomName: t.String() }),
  },
);
