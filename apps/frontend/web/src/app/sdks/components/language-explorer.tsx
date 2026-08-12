"use client";

import { cn } from "@reloop/ui/cn";
import type { CopyCodeBlockTab } from "@reloop/ui/copy-code-block";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siNpm, siPnpm, siYarn } from "simple-icons";
import { frameworksForLanguage } from "../frameworks";
import { languages } from "../languages";
import { AccountSetupActions } from "./account-setup-actions";
import { AnimatedHoverBackground } from "./animated-hover-background";
import { ExtraLinks } from "./extra-links";
import { ResourceLinks } from "./resource-links";
import { bunIcon } from "./bun-icon";
import { LanguageIcon } from "./language-icon";
import { SdkCodeBlock } from "./sdk-code-block";
import { SectionFrame } from "./section-frame";
import { useSidebarHoverBox } from "./use-sidebar-hover-box";

const nodeInstallCommands = {
	npm: "npm install reloop-email",
	pnpm: "pnpm add reloop-email",
	yarn: "yarn add reloop-email",
	bun: "bun add reloop-email",
} as const;

type PackageManager = keyof typeof nodeInstallCommands;

const NODE_PKG_TABS: CopyCodeBlockTab[] = [
	{ id: "npm", label: "npm", si: siNpm },
	{ id: "pnpm", label: "pnpm", si: siPnpm },
	{ id: "yarn", label: "yarn", si: siYarn },
	{ id: "bun", label: "bun", si: bunIcon },
];

function StepItem({
	number,
	title,
	isLast = false,
	children,
}: {
	number: number;
	title: string;
	isLast?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="flex gap-3.5">
			<div className="flex flex-col items-center">
				<div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 font-mono font-semibold text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75">
					{number}
				</div>
				{!isLast && (
					<div className="my-1.5 w-px flex-1 bg-stroke-soft-200 dark:bg-white/10" />
				)}
			</div>

			<div
				className={`flex min-w-0 flex-1 flex-col gap-2.5 ${isLast ? "" : "pb-6"}`}
			>
				<h4 className="mt-0.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
					{title}
				</h4>
				<div className="w-full min-w-0">{children}</div>
			</div>
		</div>
	);
}

export default function LanguageExplorer() {
	const [activeSlug, setActiveSlug] = useState(languages[0]!.slug);
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
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
	const relatedFrameworks = frameworksForLanguage(active.slug);

	const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<
		string | null
	>(relatedFrameworks[0]?.slug ?? null);

	const [hoveredFwEl, setHoveredFwEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [fwContainerEl, setFwContainerEl] = useState<HTMLDivElement | null>(
		null,
	);
	const fwRefs = useRef<(HTMLElement | null)[]>([]);

	// Update selected framework when active language changes
	useEffect(() => {
		const fws = frameworksForLanguage(activeSlug);
		setSelectedFrameworkSlug(fws[0]?.slug ?? null);
		setHoveredFwEl(undefined);
		fwRefs.current = [];
	}, [activeSlug]);

	const activeFramework =
		relatedFrameworks.find((fw) => fw.slug === selectedFrameworkSlug) ??
		relatedFrameworks[0] ??
		null;

	const activeFwIdx = relatedFrameworks.findIndex(
		(fw) => fw.slug === activeFramework?.slug,
	);
	const activeFwEl =
		fwRefs.current[activeFwIdx >= 0 ? activeFwIdx : 0] ?? undefined;
	const currentFwEl = hoveredFwEl ?? activeFwEl;

	const fwHoverBox = useSidebarHoverBox(
		currentFwEl,
		fwContainerEl,
		`${active.slug}:${activeFramework?.slug}`,
	);

	const installCode =
		active.slug === "nodejs"
			? nodeInstallCommands[pkgManager]
			: activeFramework
				? activeFramework.installCommand
				: active.installCommand;

	const sendCode = activeFramework ? activeFramework.sendCode : active.sendCode;
	const codeSlug = activeFramework ? activeFramework.slug : active.slug;
	const activeDisplayName = activeFramework ? activeFramework.name : active.name;

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

			{/* Content: left meta + right code steps */}
			<div
				id="lang-panel"
				role="tabpanel"
				aria-labelledby={`lang-tab-${active.slug}`}
				className="grid grid-cols-1 lg:grid-cols-12"
			>
				{/* Left meta & frameworks: compact tinted rail matching framework details */}
				<aside className="border-stroke-soft-200 border-b bg-[#fafafa] lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10 dark:bg-white/[0.025]">
					<div className="flex flex-col gap-6 p-6 sm:p-7 lg:sticky lg:top-24 lg:p-7">
						<div className="flex items-center gap-3">
							<div
								className="inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black"
								style={{ color: brandColor }}
							>
								<LanguageIcon icon={active.icon} className="size-4.5" />
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

						{relatedFrameworks.length > 0 ? (
							<div className="mt-6 flex flex-col">
								<div className="px-2.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
									Frameworks
								</div>
								<div
									ref={setFwContainerEl}
									role="tablist"
									aria-label={`${active.name} frameworks`}
									className="relative flex w-full flex-col"
									onPointerLeave={() => setHoveredFwEl(undefined)}
								>
									{relatedFrameworks.map((fw, index) => {
										const isSelected = activeFramework?.slug === fw.slug;
										return (
											<button
												key={fw.slug}
												ref={(el) => {
													if (el) fwRefs.current[index] = el;
												}}
												type="button"
												role="tab"
												aria-selected={isSelected}
												onPointerEnter={() =>
													setHoveredFwEl(fwRefs.current[index] ?? undefined)
												}
												onClick={() => {
													setSelectedFrameworkSlug(fw.slug);
												}}
												className="group relative z-10 flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-all"
											>
												<span
													className="flex size-4 shrink-0 items-center justify-center"
													style={{ color: `#${fw.icon.hex}` }}
												>
													<LanguageIcon icon={fw.icon} className="size-3.5" />
												</span>
												<span
													className={cn(
														"truncate font-medium text-[13px] transition-colors",
														isSelected
															? "text-text-strong-950 dark:text-white"
															: "text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white",
													)}
												>
													{fw.name}
												</span>
											</button>
										);
									})}

									<AnimatedHoverBackground
										box={fwHoverBox}
										className="!bg-neutral-alpha-10 dark:!bg-white/[0.08]"
									/>
								</div>
							</div>
						) : null}
					</div>
				</aside>

				{/* Right: Step-by-step playground */}
				<div className="border-stroke-soft-200 border-t p-6 sm:p-8 lg:col-span-9 lg:border-t-0 lg:p-10 dark:border-white/10">
					<div className="flex flex-col">
						<StepItem number={1} title="Get an API key and add a domain">
							<AccountSetupActions />
						</StepItem>

						<StepItem
							number={2}
							title={`Install the ${activeDisplayName} package`}
						>
							<SdkCodeBlock
								key={`install-${active.slug}-${activeFramework?.slug ?? "base"}`}
								code={installCode}
								lang="bash"
								tabs={active.slug === "nodejs" ? NODE_PKG_TABS : undefined}
								activeTab={active.slug === "nodejs" ? pkgManager : undefined}
								onTabChange={
									active.slug === "nodejs"
										? (id) => setPkgManager(id as PackageManager)
										: undefined
								}
							/>
						</StepItem>

						<StepItem
							number={3}
							title={`Send email with ${activeDisplayName}`}
						>
							<SdkCodeBlock
								key={`code-${active.slug}-${activeFramework?.slug ?? "base"}`}
								code={sendCode}
								slug={codeSlug}
							/>
						</StepItem>

						<StepItem
							number={4}
							title="GitHub, examples, and API reference"
						>
							<ResourceLinks
								languageSlug={active.slug}
								docsPath={activeFramework?.docsPath ?? active.docsPath}
								frameworkSlug={activeFramework?.slug}
							/>
						</StepItem>

						<StepItem number={5} title="Need more help?" isLast>
							<ExtraLinks />
						</StepItem>
					</div>
				</div>
			</div>
		</SectionFrame>
	);
}
