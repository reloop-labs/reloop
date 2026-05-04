"use client";

import { useEffect, useRef } from "react";
import type { WebsocketProvider } from "y-websocket";

/**
 * Broadcasts the local user's mouse position into Yjs awareness as
 * `{ mouseCursor: { x, y } }` where x/y are 0–100 percentages relative to
 * `containerRef`. Uses "mouseCursor" (not "cursor") to avoid colliding with
 * CollaborationCaret's own awareness field.
 */
export function useMousePresence(
  provider: WebsocketProvider,
  containerRef: React.RefObject<HTMLDivElement | null>,
  throttleMs = 30,
) {
  const lastEmitRef = useRef(0);

  useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastEmitRef.current < throttleMs) return;
      lastEmitRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (x < 0 || y < 0 || x > 100 || y > 100) {
        provider.awareness.setLocalStateField("mouseCursor", null);
        return;
      }

      provider.awareness.setLocalStateField("mouseCursor", { x, y });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        provider.awareness.setLocalStateField("mouseCursor", null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      provider.awareness.setLocalStateField("mouseCursor", null);
    };
  }, [provider, containerRef, throttleMs]);
}
