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

import { templateConfig } from "@be/template/template.config";
import { logger } from "@reloop/logger";
import type { Session } from "@reloop/auth/server";

export const collaborationRoute = new Elysia({
  name: "collaboration",
})
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        try {
          const cookie = headers.get("cookie");
          if (!cookie) return { user: null, session: null };

          const response = await fetch(
            `${templateConfig.BASE_URL}/api/auth/v1/get-session`,
            {
              method: "GET",
              headers: new Headers({
                "Content-Type": "application/json",
                Cookie: cookie,
              }),
            },
          );
          const session: Session | null = await response.json();

          if (session && session.user?.activeOrganizationId) {
            return {
              user: session.user,
              session: session.session,
            };
          }
          return { user: null, session: null };
        } catch (error) {
          logger.error(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            "WebSocket Authentication error",
          );
          return { user: null, session: null };
        }
      },
    },
  })
  .ws("/collab/:roomName", {
    auth: true,
    async open(ws) {
      const { session } = ws.data as unknown as { session: any };

      if (!session) {
        return ws.close(1008, "Unauthorized");
      }

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
