"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
} from "simple-icons";
import type { SetupLanguageCode } from "@fe/dashboard/lib/integration/types";

const languages = [
	{ id: "nodejs" as SetupLanguageCode, label: "Node.js", icon: siNodedotjs },
	{ id: "python" as SetupLanguageCode, label: "Python", icon: siPython },
	{ id: "php" as SetupLanguageCode, label: "PHP", icon: siPhp },
	{ id: "ruby" as SetupLanguageCode, label: "Ruby", icon: siRuby },
	{ id: "go" as SetupLanguageCode, label: "Go", icon: siGo },
] as const;

export function SetupLanguagePills({
	value,
	onChange,
}: {
	value: SetupLanguageCode;
	onChange: (lang: SetupLanguageCode) => void;
}) {
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const [pillPosition, setPillPosition] = useState<{
		width: number;
		height: number;
		left: number;
		top: number;
	} | null>(null);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = languages.findIndex((lang) => lang.id === value);
	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedBrandColor =
		highlightedTabIndex >= 0
			? `#${languages[highlightedTabIndex]?.icon.hex}`
			: undefined;

	useEffect(() => {
		if (!mounted) {
			setPillPosition(null);
			return;
		}

		const updatePosition = () => {
			const button = tabButtonRefs.current[highlightedTabIndex];
			if (!button) {
				setPillPosition(null);
				return;
			}

			const position = {
				width: button.offsetWidth,
				height: button.offsetHeight,
				left: button.offsetLeft,
				top: button.offsetTop,
			};

			const pillInset = { x: 6, y: 3 };
			setPillPosition({
				width: position.width - pillInset.x * 2,
				height: position.height - pillInset.y * 2 - 2,
				left: position.left + pillInset.x,
				top: position.top + pillInset.y,
			});
		};

		const handle = requestAnimationFrame(updatePosition);

		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(updatePosition);
			observer.observe(container);
		}

		return () => {
			cancelAnimationFrame(handle);
			observer?.disconnect();
		};
	}, [highlightedTabIndex, mounted, value]);

	return (
		<div
			ref={containerRef}
			className="scrollbar-none relative flex min-w-0 items-center overflow-x-auto"
			style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
		>
			<style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
			{languages.map((lang, index) => {
				const isActive = value === lang.id;
				const brandColor = `#${lang.icon.hex}`;
				const isHighlighted = index === highlightedTabIndex;

				let textColorStyle: React.CSSProperties | undefined;
				if (isHighlighted && pillPosition) {
					textColorStyle = { color: "#ffffff" };
				} else if (isActive) {
					textColorStyle = { color: brandColor };
				}

				return (
					<button
						key={lang.id}
						ref={(el) => {
							tabButtonRefs.current[index] = el;
						}}
						type="button"
						onClick={() => onChange(lang.id)}
						onPointerEnter={() => setHoveredTabIdx(index)}
						onPointerLeave={() => setHoveredTabIdx(undefined)}
						className={cn(
							"relative z-10 flex shrink-0 items-center gap-2 px-4 py-2.5 font-medium text-sm transition-colors duration-150",
							isActive
								? "text-text-strong-950 dark:text-white"
								: "text-text-sub-600 dark:text-white/70",
						)}
						style={textColorStyle}
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="size-3.5 shrink-0"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							style={{
								color:
									isHighlighted && pillPosition ? "#ffffff" : brandColor,
							}}
							aria-hidden
						>
							<path d={lang.icon.path} />
						</svg>
						{lang.label}
					</button>
				);
			})}
			<AnimatePresence>
				{pillPosition && highlightedTabIndex !== -1 ? (
					<motion.div
						className="pointer-events-none absolute top-0 left-0 rounded-full"
						style={{ backgroundColor: highlightedBrandColor || undefined }}
						initial={{ ...pillPosition, opacity: 0 }}
						animate={{ ...pillPosition, opacity: 1 }}
						exit={{ ...pillPosition, opacity: 0 }}
						transition={{ duration: 0.14 }}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}
