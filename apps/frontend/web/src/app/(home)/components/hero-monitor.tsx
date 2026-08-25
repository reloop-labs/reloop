"use client";

import { MacintoshRenderer } from "@reloop/web/components/macintosh/renderer";
import { useEffect, useRef } from "react";

export function MacintoshHeroMonitor() {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = hostRef.current;
		if (!el) return;
		const renderer = new MacintoshRenderer(el, { transparent: true });
		const ok = renderer.mount();
		if (ok) renderer.start();
		return () => {
			renderer.dispose();
		};
	}, []);

	return (
		<div
			ref={hostRef}
			className="size-full cursor-grab active:cursor-grabbing"
			role="application"
			aria-label="Interactive 3D Macintosh monitor. Drag to rotate, scroll to zoom."
		/>
	);
}
