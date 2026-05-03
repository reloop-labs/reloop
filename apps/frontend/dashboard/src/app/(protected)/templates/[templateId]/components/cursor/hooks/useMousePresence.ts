"use client";

import { useEffect } from "react";
import type { WebsocketProvider } from "y-websocket";

export function useMousePresence(
  provider: WebsocketProvider | null,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!provider || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();

      // Store as percentage so it works on different screen sizes
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp to container bounds
      if (x < 0 || y < 0 || x > 100 || y > 100) {
        provider.awareness.setLocalStateField("cursor", null);
        return;
      }

      provider.awareness.setLocalStateField("cursor", { x, y });
    };

    const handleMouseLeave = () => {
      provider.awareness.setLocalStateField("cursor", null);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      provider.awareness.setLocalStateField("cursor", null);
    };
  }, [provider, containerRef]);
}
