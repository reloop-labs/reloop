"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SceneGlyph } from "../../(home)/components/_shared/scene-header";
import { frameworksForLanguage } from "../frameworks";
import { languages } from "../languages";
import { AnimatedHoverBackground } from "./animated-hover-background";
import { ExtraLinks } from "./extra-links";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
import {
	NODE_PKG_TABS,
	nodeInstallCommands,
	type PackageManager,
} from "./node-install-block";
import { ResourceLinks } from "./resource-links";
import { SdkCodeBlock } from "./sdk-code-block";
import { SectionFrame } from "./section-frame";
import { useSidebarHoverBox } from "./use-sidebar-hover-box";

type PillBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

const PILL_EASE = [0.23, 1, 0.32, 1] as const;

function hexToRgb(hex: string) {
	const value = hex.replace("#", "");
	return {
		r: Number.parseInt(value.slice(0, 2), 16),
		g: Number.parseInt(value.slice(2, 4), 16),
		b: Number.parseInt(value.slice(4, 6), 16),
	};
}

function hexToRgba(hex: string, alpha: number) {
	const { r, g, b } = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darker lip under the face — same extrusion as SceneGlyph. */
function darkenHex(hex: string, amount: number) {
	const { r, g, b } = hexToRgb(hex);
	return `rgb(${Math.round(r * amount)}, ${Math.round(g * amount)}, ${Math.round(b * amount)})`;
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

export default function LanguageExplorer({
	framed = true,
	showTopRule = true,
	showHeading = false,
	showHelp = true,
	id = "languages",
}: {
	framed?: boolean;
	showTopRule?: boolean;
	showHeading?: boolean;
	showHelp?: boolean;
	id?: string;
}) {
	const [activeSlug, setActiveSlug] = useState(languages[0]!.slug);
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const [hoverPill, setHoverPill] = useState<PillBox | null>(null);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = languages.findIndex((l) => l.slug === activeSlug);
	const isHoveringOther =
		hoveredTabIdx !== undefined && hoveredTabIdx !== activeTabIndex;
	const hoverBrandColor =
		isHoveringOther && hoveredTabIdx !== undefined
			? `#${languages[hoveredTabIdx]!.icon.hex}`
			: undefined;

	const active = languages.find((l) => l.slug === activeSlug) ?? languages[0]!;
	const brandColor = `#${active.icon.hex}`;
	const relatedFrameworks = frameworksForLanguage(active.slug);

	const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<
		string | null
	>(null);

	const [hoveredFwEl, setHoveredFwEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [activeFwEl, setActiveFwEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [fwContainerEl, setFwContainerEl] = useState<HTMLDivElement | null>(
		null,
	);
	const fwRefs = useRef<(HTMLElement | null)[]>([]);

	useEffect(() => {
		setSelectedFrameworkSlug(null);
		setHoveredFwEl(undefined);
	}, [activeSlug]);

	const activeFramework = selectedFrameworkSlug
		? (relatedFrameworks.find((fw) => fw.slug === selectedFrameworkSlug) ??
			null)
		: null;

	const isLanguageSelected = activeFramework === null;
	const activeRailHex = activeFramework
		? activeFramework.icon.hex
		: active.icon.hex;
	const isDarkRail = isDarkBrandColor(activeRailHex);
	const activeRailColor = isDarkRail ? undefined : `#${activeRailHex}`;

	useLayoutEffect(() => {
		if (!fwContainerEl) {
			setActiveFwEl(undefined);
			return;
		}
		const selected = fwContainerEl.querySelector<HTMLElement>(
			'[role="tab"][aria-selected="true"]',
		);
		setActiveFwEl(selected ?? undefined);
	}, [
		fwContainerEl,
		selectedFrameworkSlug,
		activeSlug,
		relatedFrameworks.length,
	]);

	const isHoveringOtherFw = Boolean(
		hoveredFwEl && activeFwEl && hoveredFwEl !== activeFwEl,
	);

	const fwActiveBox = useSidebarHoverBox(
		activeFwEl,
		fwContainerEl,
		`${active.slug}:${activeFramework?.slug}`,
	);
	const fwHoverBox = useSidebarHoverBox(
		isHoveringOtherFw ? hoveredFwEl : undefined,
		fwContainerEl,
		`${active.slug}:hover:${activeFramework?.slug}`,
	);

	const installCode =
		active.slug === "nodejs"
			? nodeInstallCommands[pkgManager]
			: activeFramework
				? activeFramework.installCommand
				: active.installCommand;

	const sendCode = activeFramework ? activeFramework.sendCode : active.sendCode;
	const codeSlug = activeFramework ? activeFramework.slug : active.slug;
	const activeDisplayName = activeFramework
		? activeFramework.name
		: active.name;
	const headerIcon = activeFramework?.icon ?? active.icon;
	const headerPackage = activeFramework?.packageName ?? active.packageName;

	useEffect(() => {
		if (!mounted) {
			setActivePill(null);
			setHoverPill(null);
			return;
		}

		const updatePosition = () => {
			setActivePill(measureTab(tabButtonRefs.current[activeTabIndex] ?? null));
			setHoverPill(
				isHoveringOther && hoveredTabIdx !== undefined
					? measureTab(tabButtonRefs.current[hoveredTabIdx] ?? null)
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
	}, [activeTabIndex, hoveredTabIdx, isHoveringOther, mounted, activeSlug]);

	return (
		<SectionFrame id={id} framed={framed} showTopRule={showTopRule}>
			{showHeading ? (
				<div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
					<div className="flex items-center gap-2">
						<SceneGlyph icon="code" color="blue" />
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							SDK
						</span>
					</div>
					<h2
						id={`${id}-heading`}
						className="mt-3.5 max-w-3xl font-medium text-4xl text-text-strong-950 text-balance leading-[1.05] tracking-tighter sm:text-5xl dark:text-white"
					>
						Send from your favorite programming languages.
					</h2>
				</div>
			) : null}
			{/* Language tabs */}
			<div
				className={cn(
					"border-stroke-soft-200 border-b dark:border-white/10",
					showHeading && "border-t",
				)}
			>
				<div
					ref={containerRef}
					role="tablist"
					aria-label="SDK languages"
					onPointerLeave={() => setHoveredTabIdx(undefined)}
					className="scrollbar-none relative flex gap-1 overflow-x-auto px-6 py-3 sm:px-10 sm:py-3.5 lg:px-12"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{languages.map((lang, index) => {
						const isActive = lang.slug === activeSlug;
						const langBrandColor = `#${lang.icon.hex}`;
						const showActiveLabel = isActive && Boolean(activePill || !mounted);
						const isTabLangDark = isDarkBrandColor(lang.icon.hex);

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
									"relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
									!mounted && isActive
										? "bg-text-strong-950 text-white shadow-[0_1.5px_0_0_#1a1a1a,inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-white dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.08),inset_0_0.5px_0_0_rgba(255,255,255,0.28)]"
										: showActiveLabel
											? "text-white"
											: "text-text-sub-600 dark:text-white/60",
								)}
							>
								<span
									className={cn(
										"inline-flex items-center",
										!showActiveLabel &&
											isTabLangDark &&
											"text-text-strong-950 dark:text-white",
									)}
									style={{
										color: showActiveLabel
											? "#ffffff"
											: isTabLangDark
												? undefined
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
								className="pointer-events-none absolute top-0 left-0 rounded-full p-px pb-[2px]"
								style={{ backgroundColor: darkenHex(brandColor, 0.55) }}
								initial={{ ...activePill, opacity: 0 }}
								animate={{ ...activePill, opacity: 1 }}
								exit={{ ...activePill, opacity: 0 }}
								transition={{ duration: 0.2, ease: PILL_EASE }}
							>
								<div
									className="size-full rounded-full shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]"
									style={{ backgroundColor: brandColor }}
								/>
							</motion.div>
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
				{/* Left meta & frameworks: compact rail matching framework details */}
				<aside className="border-stroke-soft-200 border-b bg-transparent lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10">
					<div className="flex flex-col gap-4 px-6 py-6 sm:px-10 sm:py-7 lg:sticky lg:top-16 lg:py-8 lg:pr-5 lg:pl-12">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									"inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black",
									isDarkBrandColor(headerIcon.hex) &&
										"text-text-strong-950 dark:text-white",
								)}
								style={getBrandColorStyle(headerIcon.hex)}
							>
								<LanguageIcon icon={headerIcon} className="size-4.5" />
							</div>
							<div className="min-w-0">
								<h3 className="font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
									{activeDisplayName}
								</h3>
								<p className="truncate font-mono text-[11px] text-text-sub-600 dark:text-white/45">
									{headerPackage}
								</p>
							</div>
						</div>

						<div className="-ml-2.5 mt-3 flex flex-col">
							<div className="px-2.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
								{relatedFrameworks.length > 0 ? "Frameworks" : "SDK"}
							</div>
							<div
								ref={setFwContainerEl}
								role="tablist"
								aria-label={`${active.name} options`}
								className="relative flex w-full flex-col"
								onPointerLeave={() => setHoveredFwEl(undefined)}
							>
								<button
									ref={(el) => {
										if (el) fwRefs.current[0] = el;
									}}
									type="button"
									role="tab"
									aria-selected={isLanguageSelected}
									onPointerEnter={() =>
										setHoveredFwEl(fwRefs.current[0] ?? undefined)
									}
									onClick={() => {
										setSelectedFrameworkSlug(null);
									}}
									className="group relative z-10 flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors"
								>
									<span
										className={cn(
											"flex size-4 shrink-0 items-center justify-center",
											isDarkBrandColor(active.icon.hex) &&
												"text-text-strong-950 dark:text-white",
										)}
										style={getBrandColorStyle(active.icon.hex)}
									>
										<LanguageIcon icon={active.icon} className="size-3.5" />
									</span>
									<span
										className={cn(
											"truncate font-medium text-[13px] transition-colors",
											isLanguageSelected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white",
										)}
									>
										{active.name}
									</span>
								</button>

								{relatedFrameworks.map((fw, index) => {
									const refIndex = index + 1;
									const isSelected = activeFramework?.slug === fw.slug;
									const isFwDark = isDarkBrandColor(fw.icon.hex);
									return (
										<button
											key={fw.slug}
											ref={(el) => {
												if (el) fwRefs.current[refIndex] = el;
											}}
											type="button"
											role="tab"
											aria-selected={isSelected}
											onPointerEnter={() =>
												setHoveredFwEl(fwRefs.current[refIndex] ?? undefined)
											}
											onClick={() => {
												setSelectedFrameworkSlug(fw.slug);
											}}
											className="group relative z-10 flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors"
										>
											<span
												className={cn(
													"flex size-4 shrink-0 items-center justify-center",
													isFwDark && "text-text-strong-950 dark:text-white",
												)}
												style={getBrandColorStyle(fw.icon.hex)}
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
									className="!bg-black/[0.04] dark:!bg-white/[0.04]"
								/>
								<AnimatedHoverBackground
									box={fwActiveBox}
									className="!bg-black/[0.04] dark:!bg-white/[0.08]"
								/>
								{fwActiveBox ? (
									<motion.div
										aria-hidden
										className={cn(
											"pointer-events-none absolute z-20 w-0.5 rounded-full",
											isDarkRail && "bg-text-strong-950 dark:bg-white",
										)}
										style={
											activeRailColor
												? { backgroundColor: activeRailColor }
												: undefined
										}
										initial={false}
										animate={{
											left: fwActiveBox.left + 4,
											top: fwActiveBox.top + 8,
											height: Math.max(fwActiveBox.height - 16, 12),
										}}
										transition={{ type: "spring", bounce: 0, duration: 0.2 }}
									/>
								) : null}
							</div>
						</div>

						{/* Prerequisite: API key + domain */}
						<div className="-ml-2.5 mt-2 flex flex-col gap-1 border-stroke-soft-200 border-t pt-4 dark:border-white/10">
							<div className="px-2.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
								Prerequisite
							</div>
							<div className="flex w-full flex-col">
								<a
									href="/dashboard/api-keys/create"
									className="group dark:hover:!bg-[#0A0A0A] flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								>
									<span className="flex size-4 shrink-0 items-center justify-center text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white">
										<Icon
											name="key-new"
											className="size-3.5 shrink-0"
											aria-hidden
										/>
									</span>
									<span className="truncate">Get an API key</span>
								</a>
								<a
									href="/dashboard/domain/add"
									className="group dark:hover:!bg-[#0A0A0A] flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								>
									<span className="flex size-4 shrink-0 items-center justify-center text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white">
										<Icon
											name="globe"
											fill="none"
											className="size-3.5 shrink-0"
											aria-hidden
										/>
									</span>
									<span className="truncate">Add a domain</span>
								</a>
							</div>
						</div>
					</div>
				</aside>

				{/* Right: step-by-step playground */}
				<div className="px-6 py-6 sm:px-10 sm:py-8 lg:col-span-9 lg:py-10 lg:pr-12 lg:pl-8">
					<div className="flex flex-col">
						<StepItem
							number={1}
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

						<StepItem number={2} title={`Send email with ${activeDisplayName}`}>
							<SdkCodeBlock
								key={`code-${active.slug}-${activeFramework?.slug ?? "base"}`}
								code={sendCode}
								slug={codeSlug}
							/>
						</StepItem>

						<StepItem
							number={3}
							title="GitHub, examples, and API reference"
							isLast={!showHelp}
						>
							<ResourceLinks
								languageSlug={active.slug}
								languageName={active.name}
								name={activeDisplayName}
								docsPath={activeFramework?.docsPath ?? active.docsPath}
								frameworkSlug={activeFramework?.slug}
								variant="cards"
							/>
						</StepItem>

						{showHelp && (
							<StepItem number={4} title="Need more help?" isLast>
								<ExtraLinks />
							</StepItem>
						)}
					</div>
				</div>
			</div>
		</SectionFrame>
	);
}
