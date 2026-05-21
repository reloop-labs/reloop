import {
	type CollabClient,
	MESSAGE_AWARENESS,
	MESSAGE_SYNC,
	type Room,
} from "@be/template/plugins/room";
import { log } from "evlog";

import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";

/** Normalize whatever Elysia gives us into a clean Uint8Array */
export function toUint8Array(raw: unknown): Uint8Array {
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
export function sendInitialSync(ws: CollabClient, room: Room) {
	// Sync step 1: send our state vector so client knows what we have
	const syncEncoder = encoding.createEncoder();
	encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
	syncProtocol.writeSyncStep1(syncEncoder, room.doc);
	ws.send(encoding.toUint8Array(syncEncoder));

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
		ws.send(encoding.toUint8Array(awarenessEncoder));
	}
}

/**
 * Handle an incoming binary message from a client.
 * Routes to sync or awareness handler based on the first byte.
 */
export function handleMessage(ws: CollabClient, raw: unknown, room: Room) {
	let message: Uint8Array;
	try {
		message = toUint8Array(raw);
	} catch (err) {
		log.error({
			...{ error: err },
			message: "[collab] Failed to parse message",
		});
		return;
	}

	const decoder = decoding.createDecoder(message);
	const messageType = decoding.readVarUint(decoder);

	try {
		switch (messageType) {
			case MESSAGE_SYNC: {
				const encoder = encoding.createEncoder();
				encoding.writeVarUint(encoder, MESSAGE_SYNC);

				syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);
				if (encoding.length(encoder) > 1) {
					ws.send(encoding.toUint8Array(encoder));
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
				log.warn({
					...{ messageType },
					message: "[collab] Unknown message type",
				});
		}
	} catch (err) {
		log.error({
			...{ error: err, messageType },
			message: "[collab] Error handling message",
		});
	}

	room.lastActivity = Date.now();
}
