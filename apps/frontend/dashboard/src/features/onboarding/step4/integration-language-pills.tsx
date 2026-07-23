import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import type { IntegrationChoice } from "./types";

type PillItem =
	| { id: "ai"; label: string; hex: string; iconSvg: React.ReactNode }
	| {
			id: Exclude<IntegrationChoice, "ai">;
			label: string;
			hex: string;
			iconPath: string;
	  };

// Sparkle SVG path (matches @reloop/ui sparkling icon shape)
const SparkleIcon = ({ color }: { color: string }) => (
	<svg
		viewBox="0 0 16 16"
		className="size-3.5 shrink-0"
		fill={color}
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M8 1s-.75 3.25-2.5 4.5S1 8 1 8s3.25.75 4.5 2.5S8 15 8 15s.75-3.25 2.5-4.5S15 8 15 8s-3.25-.75-4.5-2.5S8 1 8 1Z" />
	</svg>
);

const pills: PillItem[] = [
	{
		id: "ai",
		label: "AI",
		hex: "6366f1",
		iconSvg: <SparkleIcon color="#6366f1" />,
	},
	{ id: "nodejs", label: "Node.js", hex: siNodedotjs.hex, iconPath: siNodedotjs.path },
	{ id: "python", label: "Python", hex: siPython.hex, iconPath: siPython.path },
	{ id: "go", label: "Go", hex: siGo.hex, iconPath: siGo.path },
	{ id: "php", label: "PHP", hex: siPhp.hex, iconPath: siPhp.path },
];

export function IntegrationLanguagePills({
	value,
	onChange,
}: {
	value: IntegrationChoice;
	onChange: (choice: IntegrationChoice) => void;
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

	const activeTabIndex = pills.findIndex((p) => p.id === value);
	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedPill = pills[highlightedTabIndex];
	const highlightedBrandColor = highlightedPill
		? `#${highlightedPill.hex}`
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

			const pillInset = { x: 6, y: 3 };
			setPillPosition({
				width: button.offsetWidth - pillInset.x * 2,
				height: button.offsetHeight - pillInset.y * 2 - 2,
				left: button.offsetLeft + pillInset.x,
				top: button.offsetTop + pillInset.y,
			});
		};

		const handle = requestAnimationFrame(updatePosition);
		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(() => updatePosition());
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
			className="relative flex min-w-0 flex-wrap items-center gap-1"
		>
			{pills.map((pill, index) => {
				const isActive = value === pill.id;
				const isHighlighted = index === highlightedTabIndex;
				const brandColor = `#${pill.hex}`;

				const iconColor = isHighlighted && pillPosition ? "#ffffff" : brandColor;
				const textColor = isHighlighted && pillPosition ? "#ffffff" : isActive ? brandColor : undefined;

				return (
					<button
						key={pill.id}
						ref={(el) => {
							tabButtonRefs.current[index] = el;
						}}
						type="button"
						onClick={() => onChange(pill.id)}
						onPointerEnter={() => setHoveredTabIdx(index)}
						onPointerLeave={() => setHoveredTabIdx(undefined)}
						className={cn(
							"relative z-10 flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 font-medium text-sm transition-colors duration-150",
							isActive
								? "border-transparent text-text-strong-950"
								: "border-stroke-soft-100 text-text-sub-600 dark:border-stroke-soft-100/40 dark:text-white/70",
						)}
						style={{ color: textColor }}
					>
						{"iconSvg" in pill ? (
							<span style={{ color: iconColor }}>
								{pill.iconSvg}
							</span>
						) : (
							<svg
								viewBox="0 0 24 24"
								className="size-3.5 shrink-0 transition-colors duration-150"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								style={{ color: iconColor }}
								aria-hidden="true"
							>
								<path d={pill.iconPath} />
							</svg>
						)}
						{pill.label}
					</button>
				);
			})}
			<AnimatePresence>
				{pillPosition && highlightedTabIndex !== -1 ? (
					<motion.div
						className="pointer-events-none absolute top-0 left-0 rounded-full"
						style={{ backgroundColor: highlightedBrandColor }}
						initial={{ ...pillPosition, opacity: 0 }}
						animate={{ ...pillPosition, opacity: 1 }}
						exit={{ ...pillPosition, opacity: 0 }}
						transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}
