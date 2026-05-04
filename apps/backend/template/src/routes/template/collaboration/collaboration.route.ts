import { authMiddleware } from "@be/template/middleware/auth";
import {
  clientIdsMap,
  getRoom,
  MESSAGE_USER_INFO,
  rooms,
  scheduleRoomCleanup,
} from "@be/template/plugins/room";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import * as encoding from "lib0/encoding";
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

        // Push verified user details from server to client
        if (ws.data.user) {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_USER_INFO);
          encoding.writeVarString(encoder, JSON.stringify(ws.data.user));
          ws.raw.send(encoding.toUint8Array(encoder));
        }

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

      const clientIds = clientIdsMap.get(ws.raw);
      if (clientIds) {
        awarenessProtocol.removeAwarenessStates(
          room.awareness,
          Array.from(clientIds),
          "disconnect",
        );
      }

      logger.info(
        { roomName, remainingClients: room.clients.size },
        "[collab] Client left",
      );

      if (room.clients.size === 0) {
        scheduleRoomCleanup(roomName);
      }
    },
  });
