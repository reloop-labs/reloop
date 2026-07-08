"use client";

import { useEffect, useRef } from "react";
import { AsciiWordmarkRenderer } from "./renderer";

interface AsciiWordmarkProps {
  word?: string;
  inkColor?: string;
  className?: string;
}

export function AsciiWordmark({
  word = "RELOOP",
  inkColor = "#ffffff",
  className,
}: AsciiWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const renderer = new AsciiWordmarkRenderer(el, { word, inkColor });
    const ok = renderer.mount();
    if (ok) renderer.start();

    return () => renderer.dispose();
  }, [word, inkColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    />
  );
}
