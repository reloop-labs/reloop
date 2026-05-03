import { Elysia, t } from "elysia";
import * as Y from "yjs";
import { getAllRooms } from "../plugins/collaboration";
import type { YjsPersistence } from "../plugins/persistence";

export const roomsPlugin = new Elysia({ prefix: "/api" })

  // ── List all active in-memory rooms ───────────────────────────────────
  .get("/rooms", () => {
    const rooms = getAllRooms();

    return {
      rooms: Array.from(rooms.entries()).map(([name, room]) => ({
        name,
        clients: room.clients.size,
        lastActivity: new Date(room.lastActivity).toISOString(),
      })),
    };
  })

  // ── Get a single room's info ───────────────────────────────────────────
  .get(
    "/rooms/:roomName",
    ({ params: { roomName }, error }) => {
      const room = getAllRooms().get(roomName);

      if (!room) {
        return error(404, { error: `Room "${roomName}" not found` });
      }

      return {
        name: roomName,
        clients: room.clients.size,
        lastActivity: new Date(room.lastActivity).toISOString(),
      };
    },
    {
      params: t.Object({ roomName: t.String() }),
    }
  )

  // ── Force-save a live room to Redis ───────────────────────────────────
  .post(
    "/rooms/:roomName/save",
    async ({ params: { roomName }, error, ...ctx }) => {
      const persistence = (ctx as any).persistence as YjsPersistence | null;
      const room = getAllRooms().get(roomName);

      if (!room) {
        return error(404, { error: `Room "${roomName}" not found` });
      }

      if (!persistence) {
        return error(503, { error: "Persistence unavailable" });
      }

      await persistence.writeState(roomName, room.doc);
      return { success: true, roomName };
    },
    {
      params: t.Object({ roomName: t.String() }),
    }
  )

  // ── Export a room's Yjs state as base64 ───────────────────────────────
  // Tries live room first, falls back to Redis
  .get(
    "/rooms/:roomName/export",
    async ({ params: { roomName }, error, ...ctx }) => {
      const persistence = (ctx as any).persistence as YjsPersistence | null;

      // 1. Try live room
      const liveRoom = getAllRooms().get(roomName);
      if (liveRoom) {
        const state = Y.encodeStateAsUpdate(liveRoom.doc);
        return {
          roomName,
          state: Buffer.from(state).toString("base64"),
          clients: liveRoom.clients.size,
          source: "live",
        };
      }

      // 2. Fall back to persisted state
      if (!persistence) {
        return error(503, { error: "Persistence unavailable" });
      }

      const doc = await persistence.getDoc(roomName);
      if (!doc) {
        return error(404, { error: `Room "${roomName}" not found` });
      }

      const state = Y.encodeStateAsUpdate(doc);
      return {
        roomName,
        state: Buffer.from(state).toString("base64"),
        clients: 0,
        source: "persisted",
      };
    },
    {
      params: t.Object({ roomName: t.String() }),
    }
  )

  // ── List all persisted doc names from Redis ────────────────────────────
  .get("/docs", async ({ ...ctx }) => {
    const persistence = (ctx as any).persistence as YjsPersistence | null;

    if (!persistence) {
      return { docs: [] };
    }

    const docs = await persistence.listDocs();
    return { docs };
  })

  // ── Delete a persisted doc from Redis ─────────────────────────────────
  .delete(
    "/docs/:roomName",
    async ({ params: { roomName }, error, ...ctx }) => {
      const persistence = (ctx as any).persistence as YjsPersistence | null;

      if (!persistence) {
        return error(503, { error: "Persistence unavailable" });
      }

      await persistence.deleteDoc(roomName);
      return { success: true, roomName };
    },
    {
      params: t.Object({ roomName: t.String() }),
    }
  );
