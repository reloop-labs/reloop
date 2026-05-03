"use client";

import { useEffect, useState } from "react";
import type { WebsocketProvider } from "y-websocket";

export interface RemoteCursor {
  clientId: number;
  name: string;
  color: string;
  x: number; // percentage
  y: number; // percentage
}

export function useRemoteCursors(
  provider: WebsocketProvider | null,
): RemoteCursor[] {
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => {
    if (!provider) return;

    const update = () => {
      const remote: RemoteCursor[] = [];

      provider.awareness.getStates().forEach((state, clientId) => {
        // Skip our own cursor
        if (clientId === provider.awareness.clientID) return;
        // Skip if no cursor position or no user info
        if (!state.cursor || !state.user) return;

        remote.push({
          clientId,
          name: state.user.name,
          color: state.user.color,
          x: state.cursor.x,
          y: state.cursor.y,
        });
      });

      setCursors(remote);
    };

    provider.awareness.on("change", update);
    update();

    return () => {
      provider.awareness.off("change", update);
    };
  }, [provider]);

  return cursors;
}
