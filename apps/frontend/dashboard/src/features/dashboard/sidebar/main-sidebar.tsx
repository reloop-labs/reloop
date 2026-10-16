import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";
import { OnboardingBanner } from "#/features/setup-banner/onboarding-banner";
import { SettingsSidebarItems } from "./settings-sidebar-items";
import { SidebarItems } from "./sidebar-items";
import { useSidebarCollapse } from "./use-sidebar-collapse";

const PEEK_OPEN_DELAY_MS = 60;
const PEEK_CLOSE_DELAY_MS = 120;

export function MainSidebar() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const [isHoverOpen, setIsHoverOpen] = useState(false);
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isSettingsRoute = pathWithoutSlug.startsWith("/settings");
	const [settingsPeek, setSettingsPeek] = useState(false);
	const [settingsNavDismissed, setSettingsNavDismissed] = useState(false);
	const showSettingsNav = settingsNavDismissed
		? false
		: settingsPeek || isSettingsRoute;
	const isTemplateEditor =
		Boolean(pathname.match(/\/templates\/[^/]+/)) ||
		Boolean(pathname.match(/\/campaigns\/[^/]+\/edit/));

	const openSettingsNav = () => {
		setSettingsNavDismissed(false);
		setSettingsPeek(true);
	};
	const closeSettingsNav = () => {
		setSettingsPeek(false);
		setSettingsNavDismissed(true);
	};

	useEffect(() => {
		if (!isSettingsRoute) {
			setSettingsNavDismissed(false);
			setSettingsPeek(false);
		}
	}, [isSettingsRoute]);
	const shouldReduceMotion = useReducedMotion();

	// Collapsed dashboard rail expands on hover as an overlay (page content
	// stays put) and collapses again when the pointer leaves. Small delays
	// keep it from flashing open when the cursor merely passes over.
	const canPeek = !isTemplateEditor && isCollapsed;
	const [isPeeking, setIsPeeking] = useState(false);
	const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const clearPeekTimer = useCallback(() => {
		if (peekTimerRef.current != null) {
			clearTimeout(peekTimerRef.current);
			peekTimerRef.current = null;
		}
	}, []);
	const onRailPointerEnter = (e: React.PointerEvent) => {
		if (!canPeek || e.pointerType === "touch") return;
		clearPeekTimer();
		peekTimerRef.current = setTimeout(
			() => setIsPeeking(true),
			PEEK_OPEN_DELAY_MS,
		);
	};
	const onRailPointerLeave = () => {
		clearPeekTimer();
		peekTimerRef.current = setTimeout(
			() => setIsPeeking(false),
			PEEK_CLOSE_DELAY_MS,
		);
	};
	useEffect(() => {
		if (!canPeek) {
			clearPeekTimer();
			setIsPeeking(false);
		}
	}, [canPeek, clearPeekTimer]);
	useEffect(() => clearPeekTimer, [clearPeekTimer]);

	/** Icon-only rail: collapsed and not hover-expanded. */
	const isRail = canPeek && !isPeeking;

	// Collapsed: 12px gutter centers the 32px nav items in the 56px rail.
	// Animated in step with the rail width so icons never jump sideways.
	const railPadding = isRail ? 12 : 8;
	const railPaddingTransition = {
		duration: shouldReduceMotion ? 0 : 0.15,
		ease: "easeOut",
	} as const;

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggle();
	});

	// Edge hover detection for floating peek only when in template editor & collapsed
	useEffect(() => {
		if (!isTemplateEditor || !isCollapsed) {
			setIsHoverOpen(false);
			return;
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (e.clientX <= 8) {
				setIsHoverOpen(true);
			} else if (e.clientX > 240) {
				setIsHoverOpen(false);
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [isTemplateEditor, isCollapsed]);

	// Floating peek overlay when hovering the left edge in template editor
	const renderFloatingPeek = (
		<AnimatePresence>
			{isTemplateEditor && isCollapsed && isHoverOpen && (
				<motion.div
					initial={{ x: -240, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -240, opacity: 0 }}
					transition={{
						type: "spring",
						stiffness: 220,
						damping: 26,
						mass: 0.8,
					}}
					onMouseLeave={() => setIsHoverOpen(false)}
					className="fixed top-0 bottom-0 left-0 z-50 flex h-screen w-60 flex-col overflow-hidden border-stroke-soft-100 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black"
				>
					<div className="flex h-12 items-center justify-start px-3">
						<a
							href="/home"
							aria-label="Reloop home"
							className="flex items-center gap-2"
						>
							<Logo className="-ml-1 h-8 w-8 shrink-0" />
							<p className="font-semibold text-text-strong-950">Reloop</p>
							<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
								Beta
							</span>
						</a>
					</div>

					<div className="relative flex-1 overflow-hidden px-2 py-2">
						<AnimatePresence mode="popLayout" initial={false}>
							{showSettingsNav ? (
								<motion.div
									key="settings"
									initial={{
										transform: shouldReduceMotion
											? "translateX(0%)"
											: "translateX(20%)",
										opacity: 0,
									}}
									animate={{ transform: "translateX(0%)", opacity: 1 }}
									exit={{
										transform: shouldReduceMotion
											? "translateX(0%)"
											: "translateX(20%)",
										opacity: 0,
									}}
									transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden px-2 py-2"
								>
									<SettingsSidebarItems
										isCollapsed={false}
										onCloseSettings={closeSettingsNav}
									/>
								</motion.div>
							) : (
								<motion.div
									key="main"
									initial={{
										transform: shouldReduceMotion
											? "translateX(0%)"
											: "translateX(-20%)",
										opacity: 0,
									}}
									animate={{ transform: "translateX(0%)", opacity: 1 }}
									exit={{
										transform: shouldReduceMotion
											? "translateX(0%)"
											: "translateX(-20%)",
										opacity: 0,
									}}
									transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden px-2 py-2"
								>
									<SidebarItems
										isCollapsed={false}
										onOpenSettings={openSettingsNav}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className="mt-auto flex shrink-0 flex-col gap-2 px-2 py-3">
						<OnboardingBanner isCollapsed={false} />
						<div className="px-1">
							<ThemeToggle />
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	// The outer box reserves layout width; the inner panel paints the sidebar
	// and can grow past it (hover peek) without pushing page content.
	const layoutWidthClass = isTemplateEditor
		? isCollapsed
			? "w-0 pointer-events-none"
			: "w-60"
		: isCollapsed
			? "w-14"
			: "w-60";
	const panelClass = isTemplateEditor
		? cn(
				"w-full",
				isCollapsed ? "border-r-0 opacity-0" : "border-r opacity-100",
			)
		: cn("border-r", isRail ? "w-14" : "w-60");

	return (
		<>
			{renderFloatingPeek}
			<div
				className={cn(
					"sticky top-0 h-screen shrink-0 transition-[width] duration-150 ease-out",
					isPeeking ? "z-40" : "z-10",
					layoutWidthClass,
				)}
				onPointerEnter={onRailPointerEnter}
				onPointerLeave={onRailPointerLeave}
			>
				<div
					className={cn(
						"absolute inset-y-0 left-0 flex select-none flex-col overflow-hidden border-stroke-soft-100 bg-bg-white-0 transition-[width] duration-150 ease-out dark:border-stroke-soft-100/40 dark:bg-black",
						panelClass,
					)}
				>
					<div className="flex h-full w-full flex-col">
						<div
							className={cn(
								"flex h-12 items-center transition-all duration-150 ease-out",
								isRail
									? "w-14 justify-center px-0"
									: "w-full justify-start px-3",
							)}
						>
							{isRail ? (
								<a
									href="/home"
									aria-label="Reloop home"
									className="flex items-center justify-center"
								>
									<Logo className="h-7 w-7 shrink-0" />
								</a>
							) : (
								<a
									href="/home"
									aria-label="Reloop home"
									className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
								>
									<Logo className="-ml-1 h-8 w-8 shrink-0" />
									<p className="font-semibold text-text-strong-950">Reloop</p>
									<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
										Beta
									</span>
								</a>
							)}
						</div>

						{/* Animated sidebar content slides on settings ↔ main switch */}
						<div
							className={cn(
								"relative flex-1 overflow-y-auto overflow-x-hidden py-2 transition-[padding] duration-150 ease-out",
								isRail ? "px-0" : "px-2",
							)}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								{showSettingsNav ? (
									<motion.div
										key="settings"
										initial={{
											transform: shouldReduceMotion
												? "translateX(0%)"
												: "translateX(20%)",
											opacity: 0,
											paddingLeft: railPadding,
											paddingRight: railPadding,
										}}
										animate={{
											transform: "translateX(0%)",
											opacity: 1,
											paddingLeft: railPadding,
											paddingRight: railPadding,
										}}
										exit={{
											transform: shouldReduceMotion
												? "translateX(0%)"
												: "translateX(20%)",
											opacity: 0,
										}}
										transition={{
											duration: 0.28,
											ease: [0.32, 0.72, 0, 1],
											paddingLeft: railPaddingTransition,
											paddingRight: railPaddingTransition,
										}}
										className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
									>
										<SettingsSidebarItems
											isCollapsed={isRail}
											onCloseSettings={closeSettingsNav}
										/>
									</motion.div>
								) : (
									<motion.div
										key="main"
										initial={{
											transform: shouldReduceMotion
												? "translateX(0%)"
												: "translateX(-20%)",
											opacity: 0,
											paddingLeft: railPadding,
											paddingRight: railPadding,
										}}
										animate={{
											transform: "translateX(0%)",
											opacity: 1,
											paddingLeft: railPadding,
											paddingRight: railPadding,
										}}
										exit={{
											transform: shouldReduceMotion
												? "translateX(0%)"
												: "translateX(-20%)",
											opacity: 0,
										}}
										transition={{
											duration: 0.28,
											ease: [0.32, 0.72, 0, 1],
											paddingLeft: railPaddingTransition,
											paddingRight: railPaddingTransition,
										}}
										className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
									>
										<SidebarItems
											isCollapsed={isRail}
											onOpenSettings={openSettingsNav}
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Bottom sidebar footer: setup card + theme toggle */}
						<div
							className={cn(
								"mt-auto flex shrink-0 flex-col gap-2 py-3 transition-all duration-150 ease-out",
								isRail ? "w-14 items-center px-0" : "w-full px-2",
							)}
						>
							<OnboardingBanner isCollapsed={isRail} />
							{isRail ? (
								<CollapsedThemeToggle />
							) : (
								<div className="px-1">
									<ThemeToggle />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export function CollapsedThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
	return (
		<button
			type="button"
			onClick={() => setTheme(nextTheme)}
			className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
			title={`Switch to ${nextTheme} theme`}
		>
			{/* Keep the 28px slot before mount so the footer doesn't jump. */}
			{mounted ? (
				<Icon
					name={resolvedTheme === "dark" ? "sun" : "moon"}
					className="h-4 w-4"
				/>
			) : null}
		</button>
	);
}
