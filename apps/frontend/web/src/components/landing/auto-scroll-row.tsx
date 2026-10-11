"use client";

import { cn } from "@reloop/ui/cn";
import { type ReactNode, useEffect, useRef } from "react";

/** How long to wait after a touch or manual scroll before auto-scrolling again. */
const RESUME_DELAY = 1500;

/**
 * Horizontal logo row that scrolls on its own but stays a real scroll
 * container, so people can swipe, drag, or wheel through it. Children are
 * rendered twice and the scroll position wraps at the halfway point, which
 * makes the loop seamless in both directions. Auto-scroll pauses on hover
 * and while touching, and is off for reduced-motion users.
 */
export function AutoScrollRow({
	children,
	label,
	speed = 30,
	className,
	groupClassName,
}: {
	children: ReactNode;
	label: string;
	/** Auto-scroll speed in pixels per second. */
	speed?: number;
	className?: string;
	groupClassName?: string;
}) {
	const scrollerRef = useRef<HTMLElement>(null);
	const groupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scroller = scrollerRef.current;
		const group = groupRef.current;
		if (!scroller || !group) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let frame = 0;
		let last = 0;
		let pos = scroller.scrollLeft;
		let hovering = false;
		let pausedUntil = 0;

		const wrap = () => {
			const half = group.offsetWidth;
			if (half <= 0) return;
			if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
			else if (scroller.scrollLeft <= 0) scroller.scrollLeft += half;
		};

		const tick = (now: number) => {
			const dt = last ? (now - last) / 1000 : 0;
			last = now;
			// The user moved the row themselves; continue from where they left it.
			if (Math.abs(scroller.scrollLeft - pos) > 2) pos = scroller.scrollLeft;
			if (!hovering && now >= pausedUntil) {
				pos += speed * dt;
				const half = group.offsetWidth;
				if (half > 0 && pos >= half) pos -= half;
				scroller.scrollLeft = pos;
			}
			frame = requestAnimationFrame(tick);
		};

		const pause = () => {
			pausedUntil = performance.now() + RESUME_DELAY;
		};
		const onEnter = (e: PointerEvent) => {
			if (e.pointerType === "mouse") hovering = true;
		};
		const onLeave = (e: PointerEvent) => {
			if (e.pointerType === "mouse") hovering = false;
		};

		scroller.addEventListener("pointerenter", onEnter);
		scroller.addEventListener("pointerleave", onLeave);
		scroller.addEventListener("pointerdown", pause);
		scroller.addEventListener("touchmove", pause, { passive: true });
		scroller.addEventListener("wheel", pause, { passive: true });
		scroller.addEventListener("scroll", wrap, { passive: true });
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			scroller.removeEventListener("pointerenter", onEnter);
			scroller.removeEventListener("pointerleave", onLeave);
			scroller.removeEventListener("pointerdown", pause);
			scroller.removeEventListener("touchmove", pause);
			scroller.removeEventListener("wheel", pause);
			scroller.removeEventListener("scroll", wrap);
		};
	}, [speed]);

	return (
		<section
			ref={scrollerRef}
			aria-label={label}
			className={cn(
				"overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
		>
			<div className="flex w-max">
				<div ref={groupRef} className={cn("flex", groupClassName)}>
					{children}
				</div>
				<div aria-hidden inert className={cn("flex", groupClassName)}>
					{children}
				</div>
			</div>
		</section>
	);
}
