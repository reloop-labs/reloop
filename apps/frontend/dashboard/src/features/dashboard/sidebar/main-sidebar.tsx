import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SettingsSidebarItems } from "./settings-sidebar-items";
import { SidebarItems } from "./sidebar-items";
import { useSidebarCollapse } from "./use-sidebar-collapse";

export function MainSidebar() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const [isHoverOpen, setIsHoverOpen] = useState(false);
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isSettings = pathWithoutSlug.startsWith("/settings");
	const isTemplateEditor = Boolean(pathname.match(/\/templates\/[^/]+/));
	const shouldReduceMotion = useReducedMotion();

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
					className="fixed top-0 bottom-0 left-0 z-50 flex h-screen w-60 flex-col overflow-hidden border-stroke-soft-100 border-r bg-bg-white-0 shadow-2xl dark:border-white/10 dark:bg-black"
				>
					<div className="flex h-12 items-center justify-start px-3">
						<div className="flex items-center gap-2">
							<Logo className="-ml-1 h-8 w-8 shrink-0" />
							<p className="font-semibold text-text-strong-950">Reloop</p>
							<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
								Beta
							</span>
						</div>
					</div>

					<div className="relative flex-1 overflow-hidden px-2 py-2">
						<AnimatePresence mode="popLayout" initial={false}>
							{isSettings ? (
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
									<SettingsSidebarItems isCollapsed={false} />
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
									<SidebarItems isCollapsed={false} />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	// Width & border styles based on template editor vs standard dashboard
	const getWidthClass = () => {
		if (isTemplateEditor) {
			return isCollapsed
				? "w-0 border-r-0 opacity-0 pointer-events-none"
				: "w-60 border-r opacity-100";
		}
		return isCollapsed ? "w-14 items-center px-0" : "w-60 px-0";
	};

	return (
		<>
			{renderFloatingPeek}
			<div
				className={cn(
					"sticky top-0 z-10 flex h-screen select-none flex-col overflow-hidden border-stroke-soft-100 border-r bg-transparent transition-[width] duration-200 ease-in-out dark:border-white/10",
					getWidthClass(),
				)}
			>
				<div className="flex h-full w-full flex-col">
					<div
						className={cn(
							"flex h-12 items-center transition-all duration-200 ease-in-out",
							!isTemplateEditor && isCollapsed
								? "w-14 justify-center px-0"
								: "w-full justify-start px-3",
						)}
					>
						{!isTemplateEditor && isCollapsed ? (
							<Logo className="h-7 w-7 shrink-0" />
						) : (
							<div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
								<Logo className="-ml-1 h-8 w-8 shrink-0" />
								<p className="font-semibold text-text-strong-950">Reloop</p>
								<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
									Beta
								</span>
							</div>
						)}
					</div>

					{/* Animated sidebar content — slides on settings ↔ main switch */}
					<div
						className={cn(
							"relative flex-1 overflow-y-auto overflow-x-hidden py-2 transition-[padding] duration-200 ease-in-out",
							!isTemplateEditor && isCollapsed ? "px-0" : "px-2",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{isSettings ? (
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
									transition={{
										duration: 0.28,
										ease: [0.32, 0.72, 0, 1],
									}}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
									style={{
										paddingInline: !isTemplateEditor && isCollapsed ? 0 : 8,
									}}
								>
									<SettingsSidebarItems
										isCollapsed={!isTemplateEditor && isCollapsed}
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
									transition={{
										duration: 0.28,
										ease: [0.32, 0.72, 0, 1],
									}}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
									style={{
										paddingInline: !isTemplateEditor && isCollapsed ? 0 : 8,
									}}
								>
									<SidebarItems
										isCollapsed={!isTemplateEditor && isCollapsed}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</>
	);
}
