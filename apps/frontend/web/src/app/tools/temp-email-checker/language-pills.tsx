"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { SimpleIcon } from "simple-icons";

/** Ported from `app/sdk/components/language-explorer.tsx` — keep the two in sync. */

export type PillTab = {
	id: string;
	label: string;
	icon: SimpleIcon;
};

type PillBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

const PILL_EASE = [0.23, 1, 0.32, 1] as const;

function hexToRgba(hex: string, alpha: number) {
	const value = hex.replace("#", "");
	const r = Number.parseInt(value.slice(0, 2), 16);
	const g = Number.parseInt(value.slice(2, 4), 16);
	const b = Number.parseInt(value.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isDarkBrandColor(hex: string): boolean {
	const clean = hex.replace("#", "").toLowerCase();
	if (clean === "000000" || clean === "000") return true;
	if (clean.length === 6) {
		const r = Number.parseInt(clean.slice(0, 2), 16);
		const g = Number.parseInt(clean.slice(2, 4), 16);
		const b = Number.parseInt(clean.slice(4, 6), 16);
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
	}
	return false;
}

function measureTab(button: HTMLButtonElement | null): PillBox | null {
	if (!button) return null;
	return {
		width: button.offsetWidth,
		height: button.offsetHeight,
		left: button.offsetLeft,
		top: button.offsetTop,
	};
}

export function BrandIcon({
	icon,
	className = "size-3.5",
}: {
	icon: SimpleIcon;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={cn("fill-current", className)}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}

export function LanguagePills({
	tabs,
	activeId,
	onChange,
	ariaLabel,
	idPrefix,
	controls,
	className,
}: {
	tabs: PillTab[];
	activeId: string;
	onChange: (id: string) => void;
	ariaLabel: string;
	idPrefix: string;
	controls?: string;
	className?: string;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const [mounted, setMounted] = useState(false);
	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const [hoverPill, setHoverPill] = useState<PillBox | null>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
	const isHoveringOther =
		hoveredIdx !== undefined && hoveredIdx !== activeIndex;
	const hoveredTab = hoveredIdx === undefined ? undefined : tabs[hoveredIdx];
	const hoverBrandColor =
		isHoveringOther && hoveredTab ? `#${hoveredTab.icon.hex}` : undefined;
	const activeBrandColor = `#${(tabs[activeIndex] ?? tabs[0])?.icon.hex}`;

	useEffect(() => {
		if (!mounted) {
			setActivePill(null);
			setHoverPill(null);
			return;
		}

		const updatePosition = () => {
			setActivePill(measureTab(buttonRefs.current[activeIndex] ?? null));
			setHoverPill(
				isHoveringOther && hoveredIdx !== undefined
					? measureTab(buttonRefs.current[hoveredIdx] ?? null)
					: null,
			);
		};

		const handle = requestAnimationFrame(updatePosition);
		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(updatePosition);
			observer.observe(container);
		}
		window.addEventListener("resize", updatePosition);

		return () => {
			cancelAnimationFrame(handle);
			observer?.disconnect();
			window.removeEventListener("resize", updatePosition);
		};
	}, [activeIndex, hoveredIdx, isHoveringOther, mounted]);

	return (
		<div
			ref={containerRef}
			role="tablist"
			aria-label={ariaLabel}
			onPointerLeave={() => setHoveredIdx(undefined)}
			className={cn(
				"scrollbar-none relative flex gap-1 overflow-x-auto",
				className,
			)}
			style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
		>
			{tabs.map((tab, index) => {
				const isActive = tab.id === activeId;
				const showActiveLabel = isActive && Boolean(activePill || !mounted);
				const isTabDark = isDarkBrandColor(tab.icon.hex);

				return (
					<button
						key={tab.id}
						ref={(el) => {
							buttonRefs.current[index] = el;
						}}
						type="button"
						role="tab"
						aria-selected={isActive}
						id={`${idPrefix}-tab-${tab.id}`}
						aria-controls={controls}
						onClick={() => onChange(tab.id)}
						onPointerEnter={() => setHoveredIdx(index)}
						className={cn(
							"relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
							!mounted && isActive
								? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
								: showActiveLabel
									? "text-white"
									: "text-text-sub-600 dark:text-white/60",
						)}
					>
						<span
							className={cn(
								"inline-flex items-center",
								!showActiveLabel &&
									isTabDark &&
									"text-text-strong-950 dark:text-white",
							)}
							style={{
								color: showActiveLabel
									? "#ffffff"
									: isTabDark
										? undefined
										: `#${tab.icon.hex}`,
							}}
						>
							<BrandIcon icon={tab.icon} />
						</span>
						{tab.label}
					</button>
				);
			})}

			<AnimatePresence>
				{hoverPill && hoverBrandColor ? (
					<motion.div
						key="hover-pill"
						className="pointer-events-none absolute top-0 left-0 rounded-full"
						style={{ backgroundColor: hexToRgba(hoverBrandColor, 0.14) }}
						initial={{ ...hoverPill, opacity: 0 }}
						animate={{ ...hoverPill, opacity: 1 }}
						exit={{ ...hoverPill, opacity: 0 }}
						transition={{ duration: 0.16, ease: PILL_EASE }}
					/>
				) : null}
			</AnimatePresence>

			<AnimatePresence>
				{activePill ? (
					<motion.div
						key="active-pill"
						className="pointer-events-none absolute top-0 left-0 rounded-full"
						style={{ backgroundColor: activeBrandColor }}
						initial={{ ...activePill, opacity: 0 }}
						animate={{ ...activePill, opacity: 1 }}
						exit={{ ...activePill, opacity: 0 }}
						transition={{ duration: 0.2, ease: PILL_EASE }}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}
