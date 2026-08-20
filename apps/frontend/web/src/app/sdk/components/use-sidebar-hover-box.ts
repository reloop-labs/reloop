"use client";

import { useLayoutEffect, useState } from "react";
import type { HoverBox } from "./animated-hover-background";

/**
 * Tracks the hover/active pill box relative to a sidebar container.
 * Uses getBoundingClientRect relative to containerEl so nested layout & framer transforms
 * stay 100% accurate.
 */
export function useSidebarHoverBox(
	currentEl: HTMLElement | undefined,
	containerEl: HTMLElement | null,
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

		const onScroll = () => measure();
		containerEl.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			ro.disconnect();
			containerEl.removeEventListener("scroll", onScroll);
		};
	}, [currentEl, containerEl, layoutKey]);

	return box;
}
