import { Elysia } from "elysia";
import { deleteDocRoute } from "./delete-doc/delete-doc.route";
import { exportRoomRoute } from "./export-room/export-room.route";
import { getRoomRoute } from "./get-room/get-room.route";
import { listDocsRoute } from "./list-docs/list-docs.route";
import { listRoomsRoute } from "./list-rooms/list-rooms.route";
import { saveRoomRoute } from "./save-room/save-room.route";

export const roomRoutes = new Elysia({
  name: "RoomRoutes",
})
  .use(listRoomsRoute)
  .use(getRoomRoute)
  .use(saveRoomRoute)
  .use(exportRoomRoute)
  .use(listDocsRoute)
  .use(deleteDocRoute);
