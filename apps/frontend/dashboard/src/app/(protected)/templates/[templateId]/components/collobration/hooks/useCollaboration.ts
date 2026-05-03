"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
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
  /** Flush debounce and call onUpdate immediately */
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
  serverUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:8019/api/template/collab",
  user,
  onUpdate,
  updateDebounce = 1000,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);

  // Refs so we can return stable references and clean up properly
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const idbRef = useRef<IndexeddbPersistence | null>(null);
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
    if (!roomName) return;

    // ── Yjs document ──────────────────────────────────────────────────
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // ── IndexedDB (offline support) ───────────────────────────────────
    const idb = new IndexeddbPersistence(`email-collab-${roomName}`, ydoc);
    idbRef.current = idb;
    idb.on("synced", () => {
      console.log("[collab] IndexedDB synced");
    });

    // ── WebSocket provider ────────────────────────────────────────────
    const provider = new WebsocketProvider(serverUrl, roomName, ydoc, {
      connect: true,
    });
    providerRef.current = provider;

    // ── Connection status ─────────────────────────────────────────────
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

    provider.on("connection-error", () => {
      setConnectionStatus("error");
    });

    // ── Awareness (presence / cursors) ────────────────────────────────
    provider.awareness.setLocalStateField("user", {
      name: user.name,
      color: user.color,
      avatar: user.avatar,
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
        if (ydocRef.current && onUpdateRef.current) {
          onUpdateRef.current(ydocRef.current);
        }
      }, updateDebounce);
    };

    ydoc.on("update", handleUpdate);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      ydoc.off("update", handleUpdate);
      provider.awareness.off("change", updateAwareness);
      provider.destroy();
      idb.destroy();
      ydoc.destroy();
      ydocRef.current = null;
      providerRef.current = null;
      idbRef.current = null;
    };
  }, [roomName, serverUrl, user.name, user.color, user.avatar, updateDebounce]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    isConnected,
    isSynced,
    awarenessUsers,
    connectionStatus,
    save,
  };
}
