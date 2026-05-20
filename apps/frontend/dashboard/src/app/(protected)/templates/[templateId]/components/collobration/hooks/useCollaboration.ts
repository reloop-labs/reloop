"use client";

import * as decoding from "lib0/decoding";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

const MESSAGE_USER_INFO = 2;

// ── Types ──────────────────────────────────────────────────────────────────

export interface CollabUser {
	name: string;
	color: string;
	avatar?: string;
}

export interface AwarenessUser extends CollabUser {
	clientId: number;
}

export type ConnectionStatus =
	| "connecting"
	| "connected"
	| "disconnected"
	| "error";

export interface UseCollaborationOptions {
	roomName: string;
	user: CollabUser;
	onUpdate?: (doc: Y.Doc) => void;
	updateDebounce?: number;
}

export interface UseCollaborationReturn {
	ydoc: Y.Doc;
	provider: WebsocketProvider | null;
	isConnected: boolean;
	isSynced: boolean;
	awarenessUsers: AwarenessUser[];
	connectionStatus: ConnectionStatus;
	save: () => void;
}

// ── Color helper ───────────────────────────────────────────────────────────

const USER_COLORS = [
	"#E03E3E",
	"#0B6E4F",
	"#0052CC",
	"#6554C0",
	"#FF8B00",
	"#00A3BF",
	"#E8384F",
	"#8777D9",
];

export function getRandomColor(seed = ""): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = seed.charCodeAt(i) + ((hash << 5) - hash);
	}
	return USER_COLORS[Math.abs(hash) % USER_COLORS.length]!;
}

function getWsUrl(): string {
	if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) {
		return process.env.NEXT_PUBLIC_WS_URL;
	}
	if (typeof window !== "undefined") {
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		return `${protocol}//${window.location.host}`;
	}
	return "ws://localhost:3000";
}

export function useCollaboration({
	roomName,
	user,
	onUpdate,
	updateDebounce = 1000,
}: UseCollaborationOptions): UseCollaborationReturn {
	const [collab, setCollab] = useState<{
		ydoc: Y.Doc;
		provider: WebsocketProvider;
	} | null>(null);

	const [isConnected, setIsConnected] = useState(false);
	const [isSynced, setIsSynced] = useState(false);
	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatus>("connecting");
	const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
	const [serverUser, setServerUser] = useState<CollabUser | null>(null);

	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onUpdateRef = useRef(onUpdate);
	onUpdateRef.current = onUpdate;
	const userRef = useRef(user);
	userRef.current = user;

	const save = useCallback(() => {
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		if (collab?.ydoc && onUpdateRef.current) {
			onUpdateRef.current(collab.ydoc);
		}
	}, [collab?.ydoc]);

	// ── Create and manage provider lifecycle inside useEffect ──────────
	// This ensures fresh objects are created on each mount (including
	// React 18 Strict Mode remounts) and properly cleaned up.
	useEffect(() => {
		if (!roomName) return;

		const ydoc = new Y.Doc();
		const wsUrl = getWsUrl();
		const provider = new WebsocketProvider(
			`${wsUrl}/api/template/collab`,
			roomName,
			ydoc,
			{ connect: true },
		);

		// Expose to the rest of the component via state
		setCollab({ ydoc, provider });
		setConnectionStatus("connecting");
		setIsConnected(false);
		setIsSynced(false);

		// ── Connection status ─────────────────────────────────────────
		const handleStatus = ({ status }: { status: string }) => {
			setIsConnected(status === "connected");
			setConnectionStatus(
				status === "connected"
					? "connected"
					: status === "connecting"
						? "connecting"
						: "disconnected",
			);
		};
		provider.on("status", handleStatus);

		provider.on("sync", (synced: boolean) => {
			setIsSynced(synced);
		});

		// Listen for verified user info from the server.
		// Attach the handler via the provider's status event so we catch
		// the WebSocket even if it hasn't been created yet at this point.
		const handleMessage = (event: MessageEvent) => {
			try {
				const data = event.data;
				if (!(data instanceof ArrayBuffer)) return;
				const decoder = decoding.createDecoder(new Uint8Array(data));
				const messageType = decoding.readVarUint(decoder);

				if (messageType === MESSAGE_USER_INFO) {
					const json = decoding.readVarString(decoder);
					const userData = JSON.parse(json);
					setServerUser({
						name: userData.name,
						color: userRef.current.color,
						avatar: userData.image,
					});
				}
			} catch (err) {
				console.error("[collab] Failed to parse server message", err);
			}
		};

		// Attach the native message listener once the WebSocket opens.
		// provider.ws may be null until the connection is established.
		const attachWsListener = ({ status }: { status: string }) => {
			if (status === "connected" && provider.ws) {
				provider.ws.addEventListener("message", handleMessage);
			}
		};
		provider.on("status", attachWsListener);

		// Also attach immediately if ws already exists
		if (provider.ws) {
			provider.ws.addEventListener("message", handleMessage);
		}

		provider.on("connection-error", () => {
			setConnectionStatus("error");
		});

		// ── Awareness (presence) init ─────────────────────────────────
		provider.awareness.setLocalStateField("user", {
			name: userRef.current.name,
			color: userRef.current.color,
			avatar: userRef.current.avatar,
		});

		const updateAwareness = () => {
			const users: AwarenessUser[] = Array.from(
				provider.awareness.getStates().entries(),
			)
				.filter(([, state]) => state.user)
				.map(([clientId, state]) => ({
					clientId,
					name: state.user.name,
					color: state.user.color,
					avatar: state.user.avatar,
				}));
			setAwarenessUsers(users);
		};

		provider.awareness.on("change", updateAwareness);
		updateAwareness();

		// ── Autosave ──────────────────────────────────────────────────
		const handleUpdate = () => {
			if (!onUpdateRef.current) return;
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = setTimeout(() => {
				if (onUpdateRef.current) {
					onUpdateRef.current(ydoc);
				}
			}, updateDebounce);
		};

		ydoc.on("update", handleUpdate);

		// ── Cleanup ───────────────────────────────────────────────────
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			ydoc.off("update", handleUpdate);
			provider.off("status", handleStatus);
			provider.off("status", attachWsListener);
			provider.awareness.off("change", updateAwareness);
			provider.awareness.setLocalState(null);
			provider.destroy();
			ydoc.destroy();
			setCollab(null);
		};
	}, [roomName, updateDebounce]);

	// Update user details in awareness without reconnecting
	useEffect(() => {
		if (collab?.provider) {
			const activeUser = serverUser || user;
			collab.provider.awareness.setLocalStateField("user", {
				name: activeUser.name,
				color: activeUser.color,
				avatar: activeUser.avatar,
			});
		}
	}, [collab?.provider, user.name, user.color, user.avatar, serverUser]);

	return {
		ydoc: collab?.ydoc ?? null as any,
		provider: collab?.provider ?? null,
		isConnected,
		isSynced,
		awarenessUsers,
		connectionStatus,
		save,
	};
}
