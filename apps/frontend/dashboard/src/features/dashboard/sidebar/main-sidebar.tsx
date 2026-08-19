import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SettingsSidebarItems } from "./settings-sidebar-items";
import { SidebarItems } from "./sidebar-items";
import { useSidebarCollapse } from "./use-sidebar-collapse";

export function MainSidebar() {
	const { isCollapsed, setCollapsed, toggle } = useSidebarCollapse();
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isSettings = pathWithoutSlug.startsWith("/settings");
	const isTemplateEditor = Boolean(pathname.match(/\/templates\/[^/]+/));
	const shouldReduceMotion = useReducedMotion();

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggle();
	});

	// Reveal sidebar when cursor moves to left edge (<= 8px) and auto-hide when cursor moves out (> 240px)
	useEffect(() => {
		if (!isTemplateEditor) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (isCollapsed && e.clientX <= 8) {
				setCollapsed(false);
			} else if (!isCollapsed && e.clientX > 240) {
				setCollapsed(true);
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [isTemplateEditor, isCollapsed, setCollapsed]);

	if (isTemplateEditor) {
		return (
			<>
				<div
					onMouseEnter={() => setCollapsed(false)}
					className="fixed top-0 bottom-0 left-0 z-40 w-3 cursor-ew-resize"
					title="Open sidebar"
				/>
				<AnimatePresence>
					{!isCollapsed && (
						<motion.div
							key="template-editor-floating-sidebar"
							initial={{ x: -240 }}
							animate={{ x: 0 }}
							exit={{ x: -240 }}
							transition={{ type: "spring", stiffness: 350, damping: 32 }}
							onPointerLeave={() => setCollapsed(true)}
							onMouseLeave={() => setCollapsed(true)}
							className="fixed top-0 bottom-0 left-0 z-50 flex h-screen w-60 flex-col border-stroke-soft-200 border-r bg-bg-white-0 shadow-xl dark:border-stroke-soft-100/40 dark:bg-black"
						>
							<div className="flex h-12 shrink-0 items-center justify-start pr-3 pl-3">
								<div className="flex items-center gap-2">
									<Logo className="-ml-1 w-10" />
									<p className="-ml-2 font-semibold text-text-strong-950">
										Reloop
									</p>
									<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
										Beta
									</span>
								</div>
							</div>

							{/* Animated sidebar content */}
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
											transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
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
											transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
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
			</>
		);
	}

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col border-stroke-soft-100 border-r transition-[width] duration-200 ease-in-out dark:border-white/10",
				isCollapsed ? "w-14" : "w-60",
			)}
		>
			<div
				className={cn(
					"flex items-center transition-all",
					isCollapsed
						? "h-14 w-full justify-center px-0"
						: "h-12 justify-start pr-3 pl-3",
				)}
			>
				{isCollapsed ? (
					<Logo className="h-8 w-8 shrink-0" />
				) : (
					<div className="flex items-center gap-2">
						<Logo className="-ml-1 w-10" />
						<p className="-ml-2 font-semibold text-text-strong-950">Reloop</p>
						<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</div>
				)}
			</div>

			{/* Animated sidebar content — slides on settings ↔ main switch */}
			<div
				className={cn(
					"relative flex-1 overflow-hidden py-2 transition-[padding] duration-200 ease-in-out",
					isCollapsed ? "px-0" : "px-2",
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
							transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
							className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
							style={{ paddingInline: isCollapsed ? 0 : 8 }}
						>
							<SettingsSidebarItems isCollapsed={isCollapsed} />
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
							transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
							className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
							style={{ paddingInline: isCollapsed ? 0 : 8 }}
						>
							<SidebarItems isCollapsed={isCollapsed} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
