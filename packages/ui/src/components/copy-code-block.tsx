"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react"; // (Not used here but keeping the import format clean)

export type CopyCodeBlockIcon = {
	path: string;
	hex: string;
};

export type CopyCodeBlockTab = {
	id: string;
	label: string;
	si: CopyCodeBlockIcon;
};

export function CopyCodeBlock({
	code,
	lang,
	copyValue,
	label,
	si,
	tabs,
	activeTab,
	onTabChange,
	className,
	hideLineNumbers = false,
	noScroll = false,
	maxHeight,
	title,
	titleHref,
	codeExtraPadding = false,
	action,
	icon,
}: {
	code: string;
	lang: string;
	copyValue?: string;
	label?: string;
	si?: CopyCodeBlockIcon;
	tabs?: CopyCodeBlockTab[];
	activeTab?: string;
	onTabChange?: (id: string) => void;
	className?: string;
	hideLineNumbers?: boolean;
	noScroll?: boolean;
	maxHeight?: string;
	title?: string;
	titleHref?: string;
	codeExtraPadding?: boolean;
	action?: React.ReactNode;
	icon?: React.ReactNode;
}) {
	const [copied, setCopied] = useState(false);
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const isFirstScrollRef = useRef(true);

	useEffect(() => {
		setMounted(true);
	}, []);

	const hasTabs = tabs && tabs.length > 0;

	const activeTabIndex = hasTabs
		? tabs.findIndex((tab) => tab.id === activeTab)
		: -1;

	useEffect(() => {
		if (!mounted) return;
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const activeBtn = tabButtonRefs.current[activeTabIndex];
			if (activeBtn && container.clientWidth > 0) {
				const containerLeft = container.scrollLeft;
				const containerWidth = container.clientWidth;
				const containerRight = containerLeft + containerWidth;

				const btnLeft = activeBtn.offsetLeft;
				const btnWidth = activeBtn.offsetWidth;
				const btnRight = btnLeft + btnWidth;

				if (btnLeft < containerLeft || btnRight > containerRight) {
					const targetScrollLeft =
						btnLeft < containerLeft
							? btnLeft - 16
							: btnRight - containerWidth + 16;

					container.scrollTo({
						left: Math.max(0, targetScrollLeft),
						behavior: isFirstScrollRef.current ? "auto" : "smooth",
					});
				}
				isFirstScrollRef.current = false;
			}
		};

		handleScroll();

		const observer = new ResizeObserver(() => {
			handleScroll();
		});
		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [activeTabIndex, mounted]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(copyValue ?? code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const displayLabel = label ?? lang;

	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedTab = tabButtonRefs.current[highlightedTabIndex];
	const activeTabButton = tabButtonRefs.current[activeTabIndex];
	const highlightedBrandColor =
		highlightedTabIndex >= 0 && tabs
			? `#${tabs[highlightedTabIndex]?.si.hex}`
			: undefined;
	const activeTabBrandColor =
		activeTabIndex >= 0 && tabs
			? `#${tabs[activeTabIndex]?.si.hex}`
			: undefined;

	const getTabPosition = (button: HTMLButtonElement | null | undefined) => {
		if (!button) return null;

		return {
			width: button.offsetWidth,
			height: button.offsetHeight,
			left: button.offsetLeft,
			top: button.offsetTop,
		};
	};

	const pillInset = { x: 6, y: 6 };
	const getPillPosition = (position: ReturnType<typeof getTabPosition>) => {
		if (!position) return null;

		return {
			width: position.width - pillInset.x * 2,
			height: position.height - pillInset.y * 2 - 2,
			left: position.left + pillInset.x,
			top: position.top + pillInset.y,
		};
	};

	const highlightedTabPosition = mounted
		? getTabPosition(highlightedTab)
		: null;
	const activeTabPosition = mounted ? getTabPosition(activeTabButton) : null;
	const highlightedPillPosition = getPillPosition(highlightedTabPosition);

	const copyButton = (
		<div className="flex items-center gap-2">
			{action}
			<button
				type="button"
				onClick={handleCopy}
				aria-label={copied ? "Copied" : "Copy code"}
				className="shrink-0 cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white"
			>
				<Icon name={copied ? "check" : "copy"} className="size-4 stroke-3" />
			</button>
		</div>
	);

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-[18px] border border-stroke-soft-100 bg-[#fafafa] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0e]",
				className,
			)}
		>
			<style>{`
				.scrollbar-none::-webkit-scrollbar {
					display: none;
				}
			`}</style>

			{hasTabs ? (
				<div className="flex items-center gap-3 pr-4 pl-1">
					{title ? (
						<div className="flex items-center gap-1 pl-3.5">
							{titleHref ? (
								<a
									href={titleHref}
									target="_blank"
									rel="noopener noreferrer"
									className="flex shrink-0 items-center gap-1 font-semibold text-[13px] text-text-strong-950 hover:underline dark:text-white"
								>
									{title}
									<Icon
										name="arrow-top-right"
										className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-400"
									/>
								</a>
							) : (
								<span className="shrink-0 font-semibold text-[13px] text-text-strong-950 dark:text-white">
									{title}
								</span>
							)}
							<span className="ml-2.5 text-text-sub-300 dark:text-white/20">
								|
							</span>
						</div>
					) : null}
					<div
						ref={containerRef}
						className="scrollbar-none relative flex min-w-0 flex-1 items-center overflow-x-auto"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{tabs.map((tab, index) => {
							const isActive = tab.id === activeTab;
							const brandColor = `#${tab.si.hex}`;
							return (
								<button
									key={tab.id}
									ref={(el) => {
										tabButtonRefs.current[index] = el;
									}}
									type="button"
									onClick={() => onTabChange?.(tab.id)}
									onPointerEnter={() => setHoveredTabIdx(index)}
									onPointerLeave={() => setHoveredTabIdx(undefined)}
									className={cn(
										"relative z-10 flex shrink-0 items-center gap-2 px-4 py-3 font-medium text-[13px] transition-colors",
										isActive
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 dark:text-white/70",
									)}
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="size-3.5 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={{ color: brandColor }}
										aria-hidden
									>
										<path d={tab.si.path} />
									</svg>
									{tab.label}
								</button>
							);
						})}
						<AnimatePresence>
							{highlightedPillPosition && highlightedTabIndex !== -1 ? (
								<motion.div
									className="pointer-events-none absolute top-0 left-0 rounded-lg"
									style={{
										backgroundColor: highlightedBrandColor
											? `color-mix(in srgb, ${highlightedBrandColor} 14%, transparent)`
											: undefined,
									}}
									initial={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									animate={{
										...highlightedPillPosition,
										opacity: 1,
									}}
									exit={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
						{activeTabPosition && activeTabIndex !== -1 ? (
							<motion.div
								className="pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full"
								style={{ backgroundColor: activeTabBrandColor }}
								initial={false}
								animate={{
									width: activeTabPosition.width,
									left: activeTabPosition.left,
									opacity: 1,
								}}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</div>
					{copyButton}
				</div>
			) : (
				<div className="flex items-center gap-3 px-4 py-2.5">
					<div className="flex min-w-0 flex-1 items-center gap-2.5">
						{title ? (
							<div className="flex shrink-0 items-center gap-1.5">
								{icon}
								{titleHref ? (
									<a
										href={titleHref}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 font-semibold text-[13px] text-text-strong-950 hover:underline dark:text-white"
									>
										{title}
										<Icon
											name="arrow-top-right"
											className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-400"
										/>
									</a>
								) : (
									<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										{title}
									</span>
								)}
							</div>
						) : (
							<>
								{icon ? (
									icon
								) : si ? (
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="size-3.5 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={{ color: `#${si.hex}` }}
										aria-hidden
									>
										<path d={si.path} />
									</svg>
								) : null}
								<span className="font-mono text-[11px] text-text-sub-500 dark:text-white/40">
									{displayLabel}
								</span>
							</>
						)}
					</div>
					{copyButton}
				</div>
			)}

			<div
				className="mx-0.5 mb-0.5 overflow-hidden rounded-2xl border border-stroke-soft-100/70 bg-white dark:border-stroke-soft-100/15 dark:bg-zinc-950"
				style={
					maxHeight
						? ({ "--code-max-height": maxHeight } as React.CSSProperties)
						: undefined
				}
			>
				<CodeBlock
					code={code}
					lang={lang}
					className={cn(
						codeExtraPadding
							? "[&>pre]:!pt-4 [&>pre]:!pb-4"
							: "[&>pre]:!pt-1 [&>pre]:!pb-1.5",
						"[&>pre]:!px-2 [&_.line]:!pl-8 [&_.line::before]:!w-6 [&_.line::before]:!pr-1.5 text-[12.5px] leading-5 sm:text-[13px] sm:leading-[1.3125rem] [&_.line::before]:text-[10.5px]",
						maxHeight &&
							"[&>pre]:!max-h-[var(--code-max-height)] [&>pre]:!overflow-y-auto",
					)}
					hideLineNumbers={hideLineNumbers}
					noScroll={noScroll}
				/>
			</div>
		</div>
	);
}
