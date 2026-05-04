import { authMiddleware } from "@be/template/middleware/auth";
import { getRoom, rooms, scheduleRoomCleanup } from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import * as awarenessProtocol from "y-protocols/awareness";
import { handleMessage, sendInitialSync } from "./collaboration.controllers";

export const collaborationRoute = new Elysia({
  name: "collaboration",
})
  .use(authMiddleware)
  .ws("/collab/:roomName", {
    auth: true,
    async open(ws) {
      const { user } = ws.data;
      if (!user) return ws.close(1008, "Unauthorized");
      const { roomName } = ws.data.params;
      const room = getRoom(roomName);
      const persistence: YjsPersistence | null =
        (ws.data as { persistence?: YjsPersistence | null }).persistence ??
        null;

      const init = () => {
        room.clients.add(ws.raw);
        sendInitialSync(ws.raw, room);
        logger.info(
          { roomName, totalClients: room.clients.size },
          "[collab] Client joined",
        );
      };

      if (persistence) {
        persistence
          .bindState(roomName, room.doc)
          .then(init)
          .catch((err) => {
            logger.error({ error: err, roomName }, "[collab] bindState failed");
            init(); // still connect the client, just without persisted state
          });
      } else {
        init();
      }
    },

    message(ws, raw) {
      const { roomName } = ws.data.params;
      const room = rooms.get(roomName);
      if (!room) return;

      const persistence: YjsPersistence | null =
        (ws.data as { persistence?: YjsPersistence | null }).persistence ??
        null;
      handleMessage(ws.raw, raw, room, persistence);
    },

    close(ws) {
      const { roomName } = ws.data.params;
      const room = rooms.get(roomName);
      if (!room) return;

      room.clients.delete(ws.raw);

      // Remove this client from awareness so their cursor disappears
      awarenessProtocol.removeAwarenessStates(
        room.awareness,
        [room.doc.clientID],
        "disconnect",
      );

      logger.info(
        { roomName, remainingClients: room.clients.size },
        "[collab] Client left",
      );

      if (room.clients.size === 0) {
        scheduleRoomCleanup(roomName);
      }
    },
  });
