"use client";

import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SettingsSidebarItems, SidebarItems } from "./sidebar-items";

export const MainSidebar: React.FC = () => {
	const { isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebarCollapse } =
		useUIStore();
	const pathname = usePathname();
	const isSettings = pathname.startsWith("/settings");

	useEffect(() => {
		try {
			const saved = localStorage.getItem("isSidebarCollapsed");
			if (saved !== null) {
				setIsSidebarCollapsed(saved === "true");
			}
		} catch {}
	}, [setIsSidebarCollapsed]);

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggleSidebarCollapse();
	});

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col transition-[width] duration-200 ease-in-out",
				isSidebarCollapsed ? "w-14" : "w-60",
			)}
		>
			<div
				className={cn(
					"flex items-center transition-all",
					isSidebarCollapsed
						? "h-14 w-full justify-center px-0"
						: "h-12 justify-between pr-3 pl-3",
				)}
			>
				{isSidebarCollapsed ? (
					<div className="relative flex h-full w-full items-center justify-center">
						<Logo className="h-8 w-8 shrink-0" />
						<button
							type="button"
							onClick={toggleSidebarCollapse}
							title="Toggle Sidebar (Cmd+B)"
							className="-translate-y-1/2 -right-2.5 absolute top-1/2 z-20 flex h-5 w-5 shrink-0 items-center justify-center text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							<Icon
								name="sidebar-left"
								className="h-3 w-3 transition-transform duration-200"
								style={{
									transform: "rotate(180deg)",
								}}
							/>
						</button>
					</div>
				) : (
					<>
						<div className="flex items-center gap-2">
							<Logo className="w-10" />
							<p className="-ml-2 font-semibold text-text-strong-950">Reloop</p>
							<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
								Beta
							</span>
						</div>
						<button
							type="button"
							onClick={toggleSidebarCollapse}
							title="Toggle Sidebar (Cmd+B)"
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Icon
								name="sidebar-left"
								className="h-4 w-4 transition-transform duration-200"
								style={{
									transform: "rotate(0deg)",
								}}
							/>
						</button>
					</>
				)}
			</div>

			{/* Animated sidebar content — slides on settings ↔ main switch */}
			<div
				className={cn(
					"relative flex-1 overflow-hidden py-2 transition-all",
					isSidebarCollapsed ? "px-0" : "px-2",
				)}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{isSettings ? (
						<motion.div
							key="settings"
							initial={{ x: "100%", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "100%", opacity: 0 }}
							transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
							className="scrollbar-hide absolute inset-0 overflow-y-auto overflow-x-hidden px-[inherit] py-2"
							style={{ paddingInline: isSidebarCollapsed ? 0 : 8 }}
						>
							<SettingsSidebarItems isCollapsed={isSidebarCollapsed} />
						</motion.div>
					) : (
						<motion.div
							key="main"
							initial={{ x: "-100%", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "-100%", opacity: 0 }}
							transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
							className="scrollbar-hide absolute inset-0 overflow-y-auto overflow-x-hidden py-2"
							style={{ paddingInline: isSidebarCollapsed ? 0 : 8 }}
						>
							<SidebarItems isCollapsed={isSidebarCollapsed} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
