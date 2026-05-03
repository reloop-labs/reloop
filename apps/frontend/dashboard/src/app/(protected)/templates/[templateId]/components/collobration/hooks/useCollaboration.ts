"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

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
  serverUrl?: string;
  user: CollabUser;
  onUpdate?: (doc: Y.Doc) => void;
  updateDebounce?: number;
}

export interface UseCollaborationReturn {
  ydoc: Y.Doc | null;
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

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCollaboration({
  roomName,
  serverUrl = (typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/template/collab`
    : ""),
  user,
  onUpdate,
  updateDebounce = 1000,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
  // Use reactive state so consumers re-render when ydoc/provider are ready
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const save = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (ydocRef.current && onUpdateRef.current) {
      onUpdateRef.current(ydocRef.current);
    }
  }, []);

  useEffect(() => {
    if (!roomName || !serverUrl) return;

    // ── Yjs document ──────────────────────────────────────────────────
    const newYdoc = new Y.Doc();
    ydocRef.current = newYdoc;

    // ── IndexedDB — offline persistence & faster first-load ───────────
    // const idb = new IndexeddbPersistence(`email-collab-${roomName}`, ydoc);
    // idb.on("synced", () => console.log("[collab] IndexedDB synced"));

    // ── WebSocket provider ────────────────────────────────────────────
    const newProvider = new WebsocketProvider(serverUrl, roomName, newYdoc, {
      connect: true,
    });
    providerRef.current = newProvider;

    // Expose via reactive state so consumers (cursor hooks, editor hook)
    // re-render once the instances are available
    setYdoc(newYdoc);
    setProvider(newProvider);

    // ── Connection status ─────────────────────────────────────────────
    newProvider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
      setConnectionStatus(
        status === "connected"
          ? "connected"
          : status === "connecting"
            ? "connecting"
            : "disconnected",
      );
    });

    newProvider.on("sync", (synced: boolean) => {
      setIsSynced(synced);
    });

    newProvider.on("connection-error", () => {
      setConnectionStatus("error");
    });

    // ── Awareness (presence) ──────────────────────────────────────────
    newProvider.awareness.setLocalStateField("user", {
      name: user.name,
      color: user.color,
      avatar: user.avatar,
    });

    const updateAwareness = () => {
      const users: AwarenessUser[] = Array.from(
        newProvider.awareness.getStates().entries(),
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

    newProvider.awareness.on("change", updateAwareness);
    updateAwareness();

    // ── Autosave ──────────────────────────────────────────────────────
    const handleUpdate = () => {
      if (!onUpdateRef.current) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        if (ydocRef.current && onUpdateRef.current) {
          onUpdateRef.current(ydocRef.current);
        }
      }, updateDebounce);
    };

    newYdoc.on("update", handleUpdate);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      newYdoc.off("update", handleUpdate);
      newProvider.awareness.off("change", updateAwareness);
      // Clear local awareness state BEFORE destroying the provider.
      // The CollaborationCaret cursor plugin calls createRelativePositionFromJSON
      // during editor unmount; if the Yjs doc is already torn down the shared type
      // is undefined, causing a crash. Nulling the state first lets the plugin
      // skip serialization gracefully.
      newProvider.awareness.setLocalState(null);
      newProvider.destroy();
      // idb.destroy();
      newYdoc.destroy();
      ydocRef.current = null;
      providerRef.current = null;
      setYdoc(null);
      setProvider(null);
    };
  }, [roomName, serverUrl, user.name, user.color, user.avatar, updateDebounce]);

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
