"use client";

import { useEffect, useRef, useState } from "react";
import type { Awareness } from "y-protocols/awareness";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RemoteCursorPosition {
  /** Normalised X coordinate (0–1) relative to the container */
  x: number;
  /** Normalised Y coordinate (0–1) relative to the container */
  y: number;
}

export interface RemoteCursor {
  clientId: number;
  name: string;
  color: string;
  avatar?: string;
  position: RemoteCursorPosition;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export interface UseRemoteCursorsOptions {
  awareness: Awareness | null;
  /**
   * Ref to the element whose bounding rect is used to normalise coordinates.
   * Attach this to any existing layout element — no wrapper div needed.
   */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Throttle interval for mouse-move broadcasts (ms). Default: 30 */
  throttleMs?: number;
}

export function useRemoteCursors({
  awareness,
  containerRef,
  throttleMs = 30,
}: UseRemoteCursorsOptions): RemoteCursor[] {
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const lastEmitRef = useRef(0);

  // ── Subscribe to awareness changes ──────────────────────────────────────
  useEffect(() => {
    if (!awareness) return;

    const update = () => {
      const selfId = awareness.clientID;
      const cursors: RemoteCursor[] = [];

      for (const [clientId, state] of awareness.getStates().entries()) {
        if (clientId === selfId) continue;
        if (!state.user || !state.cursor) continue;

        cursors.push({
          clientId,
          name: (state.user as { name: string }).name,
          color: (state.user as { color: string }).color,
          avatar: (state.user as { avatar?: string }).avatar,
          position: state.cursor as RemoteCursorPosition,
        });
      }

      setRemoteCursors(cursors);
    };

    awareness.on("change", update);
    update();

    return () => awareness.off("change", update);
  }, [awareness]);

  // ── Broadcast via document-level listeners (no wrapper div needed) ────────
  useEffect(() => {
    if (!awareness) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastEmitRef.current < throttleMs) return;
      lastEmitRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Guard against zero-size rect (e.g. display:none)
      if (rect.width === 0 || rect.height === 0) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      awareness.setLocalStateField("cursor", { x, y });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only clear when leaving the browser window entirely
      if (e.relatedTarget === null) {
        awareness.setLocalStateField("cursor", null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      // Clear our cursor on cleanup
      awareness.setLocalStateField("cursor", null);
    };
  }, [awareness, containerRef, throttleMs]);

  return remoteCursors;
}
