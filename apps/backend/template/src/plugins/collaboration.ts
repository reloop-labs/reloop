import { Elysia } from "elysia";
import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as map from "lib0/map";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as Y from "yjs";
import type { YjsPersistence } from "./persistence";

// ── Message type constants (y-websocket protocol) ──────────────────────────
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

// ── Room type ──────────────────────────────────────────────────────────────
interface Room {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Set<any>;
  lastActivity: number;
}

// ── In-memory room registry ────────────────────────────────────────────────
const rooms = new Map<string, Room>();

export const getRoom = (roomName: string): Room => {
  return map.setIfUndefined(rooms, roomName, () => {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);

    // When any client's awareness changes (cursor, presence),
    // broadcast the update to every other client in the room
    awareness.on(
      "update",
      ({
        added,
        updated,
        removed,
      }: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        const changedClients = [...added, ...updated, ...removed];
        const room = rooms.get(roomName);
        if (!room) return;

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients),
        );
        const message = encoding.toUint8Array(encoder);

        room.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.raw.send(message);
          }
        });
      },
    );

    return {
      doc,
      awareness,
      clients: new Set(),
      lastActivity: Date.now(),
    };
  });
};

export const getAllRooms = () => rooms;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Normalize whatever Elysia gives us into a clean Uint8Array */
function toUint8Array(raw: unknown): Uint8Array {
  if (raw instanceof Uint8Array) return raw;
  if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
  if (Buffer.isBuffer(raw)) return new Uint8Array(raw);
  // Elysia sometimes gives a plain object with numeric keys
  if (typeof raw === "object" && raw !== null) {
    return new Uint8Array(Object.values(raw) as number[]);
  }
  throw new Error(`Unexpected message type: ${typeof raw}`);
}

/**
 * Send sync step 1 + current awareness state to a newly connected client.
 * This bootstraps them with the full current document state.
 */
function sendInitialSync(ws: any, room: Room) {
  // Sync step 1: send our state vector so client knows what we have
  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(syncEncoder, room.doc);
  ws.raw.send(encoding.toUint8Array(syncEncoder));

  // Awareness: send all current user states (cursors, presence)
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        room.awareness,
        Array.from(awarenessStates.keys()),
      ),
    );
    ws.raw.send(encoding.toUint8Array(awarenessEncoder));
  }
}

/**
 * Handle an incoming binary message from a client.
 * Routes to sync or awareness handler based on the first byte.
 */
function handleMessage(
  ws: any,
  raw: unknown,
  room: Room,
  persistence: YjsPersistence | null,
) {
  let message: Uint8Array;
  try {
    message = toUint8Array(raw);
  } catch (err) {
    console.error("[collab] Failed to parse message:", err);
    return;
  }

  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case MESSAGE_SYNC: {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);

      const syncMessageType = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        room.doc,
        ws,
      );

      // If we produced a response (e.g. sync step 2 / update), send it back
      if (encoding.length(encoder) > 1) {
        ws.raw.send(encoding.toUint8Array(encoder));
      }

      // Sync step 2 means the client just sent us their full state —
      // broadcast to all other clients and persist
      if (syncMessageType === syncProtocol.messageYjsSyncStep2) {
        const update = Y.encodeStateAsUpdate(room.doc);
        const broadcastEncoder = encoding.createEncoder();
        encoding.writeVarUint(broadcastEncoder, MESSAGE_SYNC);
        syncProtocol.writeUpdate(broadcastEncoder, update);
        const broadcastMessage = encoding.toUint8Array(broadcastEncoder);

        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.raw.send(broadcastMessage);
          }
        });

        // Persist asynchronously — don't block the message handler
        if (persistence) {
          const roomName = getRoomName(room);
          if (roomName) {
            persistence.writeState(roomName, room.doc).catch(console.error);
          }
        }
      }
      break;
    }

    case MESSAGE_AWARENESS: {
      awarenessProtocol.applyAwarenessUpdate(
        room.awareness,
        decoding.readVarUint8Array(decoder),
        ws,
      );
      break;
    }

    default:
      console.warn(`[collab] Unknown message type: ${messageType}`);
  }

  room.lastActivity = Date.now();
}

/** Reverse-lookup room name from room object */
function getRoomName(room: Room): string | undefined {
  for (const [name, r] of rooms.entries()) {
    if (r === room) return name;
  }
  return undefined;
}

/** Schedule room cleanup after inactivity */
function scheduleRoomCleanup(roomName: string) {
  setTimeout(
    () => {
      const room = rooms.get(roomName);
      if (room && room.clients.size === 0) {
        room.doc.destroy();
        rooms.delete(roomName);
        console.log(`[collab] Room "${roomName}" destroyed (inactive)`);
      }
    },
    5 * 60 * 1000, // 5 minutes
  );
}

// ── Elysia plugin ──────────────────────────────────────────────────────────

export const collaborationPlugin = new Elysia({
  name: "collaboration",
}).ws("/collab/:roomName", {
  open(ws) {
    const { roomName } = ws.data.params;
    const room = getRoom(roomName);
    const persistence: YjsPersistence | null = (ws.data as any).persistence;

    const init = () => {
      room.clients.add(ws);
      sendInitialSync(ws, room);
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

    const persistence: YjsPersistence | null = (ws.data as any).persistence;
    handleMessage(ws, raw, room, persistence);
  },

  close(ws) {
    const { roomName } = ws.data.params;
    const room = rooms.get(roomName);
    if (!room) return;

    room.clients.delete(ws);

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
