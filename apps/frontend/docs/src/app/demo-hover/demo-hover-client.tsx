"use client";

import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { cn } from "@reloop/fe-docs/lib/cn";
import { useCallback, useEffect, useRef, useState } from "react";

function DemoCard({ mode }: { mode: "before" | "after" }) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ w: 0, h: 0 });
	const [rest, setRest] = useState({ w: 0, h: 0 });
	const [hover, setHover] = useState(false);

	const measure = useCallback(() => {
		const el = ref.current;
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return { w: Math.round(r.width), h: Math.round(r.height) };
	}, []);

	// Capture resting size on mount (re-measure late for webfont settling)
	useEffect(() => {
		const snap = () => {
			const s = measure();
			if (s) {
				setSize(s);
				setRest(s);
			}
		};
		snap();
		const t = setTimeout(snap, 600);
		window.addEventListener("resize", snap);
		return () => {
			clearTimeout(t);
			window.removeEventListener("resize", snap);
		};
	}, [measure]);

	// Re-measure after the hover transition settles
	useEffect(() => {
		const t = setTimeout(() => {
			const s = measure();
			if (s) setSize(s);
		}, 350);
		return () => clearTimeout(t);
	}, [hover, measure]);

	const shifted = size.w !== rest.w || size.h !== rest.h;
	const isBefore = mode === "before";

	return (
		<div className="flex flex-col rounded-3xl bg-bg-white-0 p-8 dark:bg-black">
			<p className="m-0 text-center font-bold text-2xl tracking-tight">
				{isBefore ? "BEFORE" : "AFTER"}
			</p>

			{/* Stage */}
			<div className="flex justify-center py-10">
				<div
					ref={ref}
					onMouseEnter={() => setHover(true)}
					onMouseLeave={() => setHover(false)}
					className={cn(
						"flex w-56 cursor-pointer flex-col gap-4 rounded-2xl bg-bg-white-0 p-4 transition-all dark:bg-zinc-950",
						isBefore
							? "border border-stroke-soft-100 hover:border-2 hover:border-black dark:border-stroke-soft-100/40 dark:hover:border-white"
							: "border-2 border-transparent shadow-[inset_0_0_0_1px_var(--color-stroke-soft-100)] hover:border-black hover:shadow-none dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-stroke-soft-100)_40%,transparent)] dark:hover:border-white dark:hover:shadow-none",
					)}
				>
					<div className="text-text-sub-600">
						<SimpleIcon name="siNextdotjs" size={16} />
					</div>
					<p className="m-0 font-semibold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
						Next.js
					</p>
				</div>
			</div>

			{/* Live size readout */}
			<p className="m-0 text-center font-mono text-2xl tabular-nums">
				{size.w} <span className="text-text-sub-600">×</span> {size.h}
			</p>
			<p
				className={cn(
					"mt-1 mb-0 text-center font-semibold text-sm",
					shifted ? "text-red-500" : "text-emerald-500",
				)}
			>
				{rest.w === 0
					? "measuring…"
					: shifted
						? `SHIFTED (+${size.w - rest.w}px × +${size.h - rest.h}px)`
						: "STABLE — 0px moved"}
			</p>

			{/* In-flow witness text: jumps on the left, rock solid on the right */}
		</div>
	);
}

export function DemoHover() {
	return (
		<div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col justify-center px-6 py-16">
			<div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
				<DemoCard mode="before" />
				<div
					aria-hidden
					className="h-px w-full bg-black/10 lg:h-auto lg:w-px dark:bg-white/10"
				/>
				<DemoCard mode="after" />
			</div>
		</div>
	);
}
