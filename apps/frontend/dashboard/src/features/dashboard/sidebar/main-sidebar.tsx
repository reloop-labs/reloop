import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { SettingsSidebarItems } from "./settings-sidebar-items";
import { SidebarItems } from "./sidebar-items";
import { useSidebarCollapse } from "./use-sidebar-collapse";

export function MainSidebar() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isSettings = pathWithoutSlug.startsWith("/settings");
	const shouldReduceMotion = useReducedMotion();

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggle();
	});

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col transition-[width] duration-200 ease-in-out",
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
