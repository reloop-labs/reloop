"use client";

import { useLayoutEffect, useState } from "react";
import type { HoverBox } from "#/features/onboarding/animated-hover-background";

/** Sidebar width transition is 200ms — also remeasure after it settles. */
const COLLAPSE_SETTLE_MS = 220;

/**
 * Tracks the hover/active pill box relative to a sidebar container.
 * Uses getBoundingClientRect (not offsetLeft) so nested sections, flex
 * centering, and framer-motion transforms don't throw position off.
 * ResizeObserver keeps the pill glued during collapse/expand.
 */
export function useSidebarHoverBox(
	currentEl: HTMLElement | undefined,
	containerEl: HTMLElement | null,
	/** Extra deps that change layout (e.g. isCollapsed). */
	layoutKey?: string | number | boolean,
): HoverBox | null {
	const [box, setBox] = useState<HoverBox | null>(null);

	useLayoutEffect(() => {
		if (!currentEl || !containerEl) {
			setBox(null);
			return;
		}

		const measure = () => {
			const tabRect = currentEl.getBoundingClientRect();
			const containerRect = containerEl.getBoundingClientRect();
			const next: HoverBox = {
				left: tabRect.left - containerRect.left + containerEl.scrollLeft,
				top: tabRect.top - containerRect.top + containerEl.scrollTop,
				width: tabRect.width,
				height: tabRect.height,
			};
			setBox((prev) => {
				if (
					prev &&
					prev.left === next.left &&
					prev.top === next.top &&
					prev.width === next.width &&
					prev.height === next.height
				) {
					return prev;
				}
				return next;
			});
		};

		measure();

		const ro = new ResizeObserver(() => {
			measure();
		});
		ro.observe(currentEl);
		ro.observe(containerEl);

		// Catch end of sidebar width transition.
		const settleId = window.setTimeout(measure, COLLAPSE_SETTLE_MS);

		// Scroll of an overflow ancestor shifts getBoundingClientRect.
		const onScroll = () => measure();
		containerEl.addEventListener("scroll", onScroll, { passive: true });
		// Parent scrollport (motion.div overflow-y-auto)
		const scrollParent = containerEl.parentElement;
		scrollParent?.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			ro.disconnect();
			window.clearTimeout(settleId);
			containerEl.removeEventListener("scroll", onScroll);
			scrollParent?.removeEventListener("scroll", onScroll);
		};
	}, [currentEl, containerEl, layoutKey]);

	return box;
}
