"use client";

import * as decoding from "lib0/decoding";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	provider: WebsocketProvider;
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

export function useCollaboration({
	roomName,
	user,
	onUpdate,
	updateDebounce = 1000,
}: UseCollaborationOptions): UseCollaborationReturn {
	const { ydoc, provider } = useMemo(() => {
		const y = new Y.Doc();
		const p = new WebsocketProvider(
			`${process.env.NEXT_PUBLIC_WS_URL}/api/template/collab`,
			roomName,
			y,
			{ connect: true },
		);
		return { ydoc: y, provider: p };
	}, [roomName]);

	const [isConnected, setIsConnected] = useState(false);
	const [isSynced, setIsSynced] = useState(false);
	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatus>("connecting");
	const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
	const [serverUser, setServerUser] = useState<CollabUser | null>(null);

	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onUpdateRef = useRef(onUpdate);
	onUpdateRef.current = onUpdate;

	const save = useCallback(() => {
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		if (ydoc && onUpdateRef.current) {
			onUpdateRef.current(ydoc);
		}
	}, [ydoc]);

	useEffect(() => {
		if (!roomName) return;
		provider.on("status", ({ status }: { status: string }) => {
			setIsConnected(status === "connected");
			setConnectionStatus(
				status === "connected"
					? "connected"
					: status === "connecting"
						? "connecting"
						: "disconnected",
			);
		});
		provider.on("sync", (synced: boolean) => {
			setIsSynced(synced);
		});

		// Listen for verified user info from the server
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
						color: user.color, // keep local color
						avatar: userData.image,
					});
				}
			} catch (err) {
				console.error("[collab] Failed to parse server message", err);
			}
		};

		provider.ws?.addEventListener("message", handleMessage);

		provider.on("connection-error", () => {
			setConnectionStatus("error");
		});

		// ── Awareness (presence) init ─────────────────────────────────────
		const activeUser = serverUser || user;
		provider.awareness.setLocalStateField("user", {
			name: activeUser.name,
			color: activeUser.color,
			avatar: activeUser.avatar,
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

		// ── Autosave ──────────────────────────────────────────────────────
		const handleUpdate = () => {
			if (!onUpdateRef.current) return;
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = setTimeout(() => {
				if (ydoc && onUpdateRef.current) {
					onUpdateRef.current(ydoc);
				}
			}, updateDebounce);
		};

		ydoc.on("update", handleUpdate);

		// ── Cleanup ───────────────────────────────────────────────────────
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			ydoc.off("update", handleUpdate);
			provider.awareness.off("change", updateAwareness);
			// Clear local awareness state BEFORE destroying the provider.
			provider.awareness.setLocalState(null);
			provider.destroy();
			ydoc.destroy();
		};
	}, [roomName, updateDebounce, provider, ydoc]);

	// Update user details in awareness without reconnecting
	useEffect(() => {
		if (provider) {
			const activeUser = serverUser || user;
			provider.awareness.setLocalStateField("user", {
				name: activeUser.name,
				color: activeUser.color,
				avatar: activeUser.avatar,
			});
		}
	}, [provider, user.name, user.color, user.avatar, serverUser]);

	return {
		ydoc,
		provider,
		isConnected,
		isSynced,
		awarenessUsers,
		connectionStatus,
		save,
	};
}
