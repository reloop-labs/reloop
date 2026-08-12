"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";
import { SdkCodeBlock } from "./sdk-code-block";
import { SectionFrame } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function LanguageExplorer() {
	const [activeSlug, setActiveSlug] = useState(languages[0]!.slug);
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

	const activeTabIndex = languages.findIndex((l) => l.slug === activeSlug);
	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedBrandColor =
		highlightedTabIndex >= 0
			? `#${languages[highlightedTabIndex]!.icon.hex}`
			: undefined;

	const active = languages.find((l) => l.slug === activeSlug) ?? languages[0]!;
	const brandColor = `#${active.icon.hex}`;

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

			setPillPosition({
				width: button.offsetWidth,
				height: button.offsetHeight,
				left: button.offsetLeft,
				top: button.offsetTop,
			});
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
	}, [highlightedTabIndex, mounted, activeSlug]);

	return (
		<SectionFrame id="languages">
			<SectionTitle title="Pick your runtime." icon="terminal" />

			{/* Language tabs */}
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div
					ref={containerRef}
					role="tablist"
					aria-label="SDK languages"
					onPointerLeave={() => setHoveredTabIdx(undefined)}
					className="scrollbar-none relative flex gap-1 overflow-x-auto px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{languages.map((lang, index) => {
						const isActive = lang.slug === activeSlug;
						const langBrandColor = `#${lang.icon.hex}`;
						const isHighlighted = index === highlightedTabIndex;

						let textColorStyle: React.CSSProperties | undefined;
						if (isHighlighted && pillPosition) {
							textColorStyle = { color: "#ffffff" };
						}

						return (
							<button
								key={lang.slug}
								ref={(el) => {
									tabButtonRefs.current[index] = el;
								}}
								type="button"
								role="tab"
								aria-selected={isActive}
								id={`lang-tab-${lang.slug}`}
								aria-controls="lang-panel"
								onClick={() => setActiveSlug(lang.slug)}
								onPointerEnter={() => setHoveredTabIdx(index)}
								className={cn(
									"relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs transition-colors duration-150",
									!mounted && isActive
										? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
										: isHighlighted && pillPosition
											? "text-white"
											: "text-text-sub-600 dark:text-white/60",
								)}
								style={textColorStyle}
							>
								<span
									className="inline-flex items-center transition-colors duration-150"
									style={{
										color:
											isHighlighted && pillPosition
												? "#ffffff"
												: langBrandColor,
									}}
								>
									<LanguageIcon icon={lang.icon} className="size-3.5" />
								</span>
								{lang.name}
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
								transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							/>
						) : null}
					</AnimatePresence>
				</div>
			</div>

			{/* Content: left meta + right code */}
			<div
				id="lang-panel"
				role="tabpanel"
				aria-labelledby={`lang-tab-${active.slug}`}
				className="grid grid-cols-1 lg:grid-cols-12"
			>
				{/* Left */}
				<div className="flex flex-col justify-between gap-8 border-stroke-soft-200 p-6 sm:p-8 lg:col-span-4 lg:border-r lg:p-10 dark:border-white/10">
					<div>
						<div className="flex items-center gap-3">
							<div
								className="inline-flex size-11 items-center justify-center rounded-xl border border-stroke-soft-200 dark:border-white/10"
								style={{ color: brandColor }}
							>
								<LanguageIcon icon={active.icon} className="size-5" />
							</div>
							<div className="min-w-0">
								<h3 className="font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
									{active.name}
								</h3>
								<p className="truncate font-mono text-[11px] text-text-sub-600 dark:text-white/45">
									{active.packageName}
								</p>
							</div>
						</div>

						<p className="mt-5 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{active.shortDescription}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<p className="mb-2 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
								Install
							</p>
							<SdkCodeBlock
								key={`install-${active.slug}`}
								code={active.installCommand}
								lang="bash"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<a
								href="/dashboard/signup"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} inline-flex h-9! rounded-full! px-4! font-medium text-xs! dark:bg-white dark:text-black dark:hover:bg-white/90`}
							>
								Get API Key
							</a>
							<Link
								href={`/languages/${active.slug}`}
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} inline-flex h-9! rounded-full! px-4! font-medium text-xs!`}
							>
								{active.name} guide →
							</Link>
						</div>
					</div>
				</div>

				{/* Right: Reloop code UI */}
				<div className="border-stroke-soft-200 border-t p-6 sm:p-8 lg:col-span-8 lg:border-t-0 lg:p-8 dark:border-white/10">
					<p className="mb-3 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
						Sample
					</p>
					<SdkCodeBlock
						key={`code-${active.slug}`}
						code={active.sendCode}
						slug={active.slug}
					/>
				</div>
			</div>
		</SectionFrame>
	);
}
