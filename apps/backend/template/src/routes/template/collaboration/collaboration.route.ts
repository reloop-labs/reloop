import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia } from "elysia";
import * as awarenessProtocol from "y-protocols/awareness";
import {
  type CollabClient,
  getRoom,
  rooms,
  scheduleRoomCleanup,
} from "@be/template/plugins/room";
import { handleMessage, sendInitialSync } from "./collaboration.controllers";

export const collaborationRoute = new Elysia({
  name: "collaboration",
}).ws("/collab/:roomName", {
  open(ws) {
    const { roomName } = ws.data.params;
    const room = getRoom(roomName);
    const persistence: YjsPersistence | null =
      (ws.data as { persistence?: YjsPersistence | null }).persistence ?? null;

    const init = () => {
      room.clients.add(ws as unknown as CollabClient);
      sendInitialSync(ws as unknown as CollabClient, room);
      console.log(
        `[collab] "${roomName}" — client joined (total: ${room.clients.size})`,
      );
    };

    if (persistence) {
      persistence
        .bindState(roomName, room.doc)
        .then(init)
        .catch((err) => {
          console.error(`[collab] bindState failed for "${roomName}":`, err);
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
      (ws.data as { persistence?: YjsPersistence | null }).persistence ?? null;
    handleMessage(ws as unknown as CollabClient, raw, room, persistence);
  },

  close(ws) {
    const { roomName } = ws.data.params;
    const room = rooms.get(roomName);
    if (!room) return;

    room.clients.delete(ws as unknown as CollabClient);

    // Remove this client from awareness so their cursor disappears
    awarenessProtocol.removeAwarenessStates(
      room.awareness,
      [room.doc.clientID],
      "disconnect",
    );

    console.log(
      `[collab] "${roomName}" — client left (remaining: ${room.clients.size})`,
    );

    if (room.clients.size === 0) {
      scheduleRoomCleanup(roomName);
    }
  },
});
