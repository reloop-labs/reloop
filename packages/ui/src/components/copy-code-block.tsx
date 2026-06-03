"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

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
	windowTitle,
	si,
	tabs,
	activeTab,
	onTabChange,
	className,
	hideLineNumbers = false,
	noScroll = true,
}: {
	code: string;
	lang: string;
	copyValue?: string;
	label?: string;
	windowTitle?: string;
	si?: CopyCodeBlockIcon;
	tabs?: CopyCodeBlockTab[];
	activeTab?: string;
	onTabChange?: (id: string) => void;
	className?: string;
	hideLineNumbers?: boolean;
	noScroll?: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
	const hasTabs = tabs && tabs.length > 0;
	const addressBarTitle = windowTitle ?? displayLabel;
	const addressBarIcon = hasTabs
		? tabs.find((tab) => tab.id === activeTab)?.si
		: si;

	const activeTabIndex = hasTabs
		? tabs.findIndex((tab) => tab.id === activeTab)
		: -1;
	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedTab = tabButtonRefs.current[highlightedTabIndex];
	const activeTabButton = tabButtonRefs.current[activeTabIndex];
	const highlightedBrandColor =
		highlightedTabIndex >= 0 && tabs
			? `#${tabs[highlightedTabIndex]?.si.hex}`
			: undefined;
	const activeTabBrandColor =
		activeTabIndex >= 0 && tabs ? `#${tabs[activeTabIndex]?.si.hex}` : undefined;

	const getTabPosition = (button: HTMLButtonElement | null | undefined) => {
		if (!button) return null;
		const rect = button.getBoundingClientRect();
		const parent = button.offsetParent?.getBoundingClientRect();
		if (!parent) return null;

		return {
			width: rect.width,
			height: rect.height,
			left: rect.left - parent.left,
			top: rect.top - parent.top,
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

	const highlightedTabPosition = getTabPosition(highlightedTab);
	const activeTabPosition = getTabPosition(activeTabButton);
	const highlightedPillPosition = getPillPosition(highlightedTabPosition);

	const copyButton = (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy code"}
			className="shrink-0 cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white"
		>
			<Icon name={copied ? "check" : "copy"} className="size-4 stroke-3" />
		</button>
	);

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-2xl border border-stroke-soft-100 bg-transparent dark:border-stroke-soft-100/40",
				className,
			)}
		>
			{/* Browser chrome */}
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="flex shrink-0 gap-1.5">
					<div className="size-3 rounded-full bg-bg-weak-50" />
					<div className="size-3 rounded-full bg-bg-weak-50" />
					<div className="size-3 rounded-full bg-bg-weak-50" />
				</div>

				<div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 font-medium text-text-sub-600 text-xs dark:text-white/45">
					{addressBarIcon ? (
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="size-3.5 shrink-0"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							style={{ color: `#${addressBarIcon.hex}` }}
							aria-hidden
						>
							<path d={addressBarIcon.path} />
						</svg>
					) : null}
					<span className="truncate font-mono">{addressBarTitle}</span>
				</div>

				<div className="size-4 shrink-0" aria-hidden />
			</div>

			{hasTabs ? (
				<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 dark:border-stroke-soft-100/40">
					<div className="relative flex min-w-0 flex-1 items-center">
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
										"relative z-10 flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors",
										isActive
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 dark:text-white/70",
									)}
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="size-4 shrink-0"
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
				<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						{si ? (
							<svg
								role="img"
								viewBox="0 0 24 24"
								className="size-4 shrink-0"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								style={{ color: `#${si.hex}` }}
								aria-hidden
							>
								<path d={si.path} />
							</svg>
						) : null}
						<span className="font-medium text-sm text-text-sub-600 dark:text-white/50">
							{displayLabel}
						</span>
					</div>
					{copyButton}
				</div>
			)}

			<div className="bg-transparent">
				<CodeBlock
					code={code}
					lang={lang}
					className="text-[13px] leading-5 sm:text-sm sm:leading-[1.375rem] [&>pre]:!p-3 [&_.line]:!pl-[2.75rem] [&_.line::before]:!w-9 [&_.line::before]:!pr-2 [&_.line::before]:text-[11px]"
					hideLineNumbers={hideLineNumbers}
					noScroll={noScroll}
				/>
			</div>
		</div>
	);
}
