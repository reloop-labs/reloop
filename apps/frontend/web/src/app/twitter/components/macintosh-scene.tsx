"use client";

import { useEffect, useRef, useState } from "react";
import { MacintoshRenderer } from "./macintosh/renderer";

export function MacintoshScene() {
	const hostRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<MacintoshRenderer | null>(null);
	const [wireframe, setWireframe] = useState(false);
	const [hint, setHint] = useState(true);

	useEffect(() => {
		const el = hostRef.current;
		if (!el) return;
		const renderer = new MacintoshRenderer(el);
		const ok = renderer.mount();
		if (ok) renderer.start();
		rendererRef.current = renderer;
		return () => {
			renderer.dispose();
			rendererRef.current = null;
		};
	}, []);

	useEffect(() => {
		rendererRef.current?.setWireframe(wireframe);
	}, [wireframe]);

	return (
		<div className="relative size-full">
			<div
				ref={hostRef}
				className="size-full cursor-grab active:cursor-grabbing"
				role="application"
				aria-label="Interactive 3D Macintosh. Drag to rotate, scroll to zoom."
				onPointerDown={() => setHint(false)}
			/>
			<div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
				<p
					className={`font-medium text-[11px] text-white/55 uppercase tracking-[0.18em] transition-opacity duration-500 ${
						hint ? "opacity-100" : "opacity-0"
					}`}
				>
					Drag to orbit · Scroll to zoom
				</p>
			</div>
			<button
				type="button"
				onClick={() => setWireframe((v) => !v)}
				className="absolute right-5 bottom-5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-medium text-[11px] text-white/80 uppercase tracking-[0.14em] backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
				aria-pressed={wireframe}
			>
				{wireframe ? "Solid" : "Wireframe"}
			</button>
		</div>
	);
}
