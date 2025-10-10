"use client";

import { mainNavigation } from "@dashboard/constants";
import { useLayout } from "@dashboard/providers/layout-provider";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

interface MainSidebarProps {
	className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
	const [idx, setIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLAnchorElement[]>([]);
	const pathname = usePathname();
	const { activeOrganization } = useUserOrganization();
	const { isSidebarCollapsed, toggleSidebarCollapse } = useLayout();
	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeIndex = mainNavigation.findIndex((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	const currentIdx = idx !== undefined ? idx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<motion.div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col border-stroke-soft-100 border-r bg-bg-white-0",
				isSidebarCollapsed ? "w-14" : "w-56",
				className,
			)}
			animate={{ width: isSidebarCollapsed ? 56 : 224 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			<div className="flex items-center justify-between border-stroke-soft-100 border-b p-2">
				<AnimatePresence mode="wait">
					{!isSidebarCollapsed && (
						<motion.div
							className="flex items-center gap-2"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.15 }}
						>
							<Logo className="h-8 w-8 rounded-full" />
							<div className="flex items-center gap-2">
								<p className="text-text-disabled-300">/</p>
								<span className="font-medium text-sm text-text-strong-950">
									{activeOrganization?.name}
								</span>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{isSidebarCollapsed && (
					<div className="flex w-full justify-center">
						<Logo className="h-8 w-8 rounded-full" />
					</div>
				)}

				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={toggleSidebarCollapse}
					className={cn(isSidebarCollapsed && "absolute right-2")}
				>
					<Button.Icon>
						<Icon
							name={isSidebarCollapsed ? "sidebar-right" : "sidebar-left"}
						/>
					</Button.Icon>
				</Button.Root>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<div className="relative space-y-1">
					{mainNavigation.map(({ path, label, iconName }, index) => {
						const href = `/${activeOrganization.slug}${path}`;

						return (
							<Link
								key={path + index}
								href={href}
								ref={(el) => {
									if (el) {
										buttonRefs.current[index] = el;
									}
								}}
								onPointerEnter={() => setIdx(index)}
								onPointerLeave={() => setIdx(undefined)}
								className={cn(
									"flex h-8 items-center gap-2 rounded-lg px-2 text-left transition-colors",
									isSidebarCollapsed ? "justify-center" : "justify-start",
									!rect && currentIdx === index && "bg-neutral-alpha-10",
									"hover:bg-neutral-alpha-5",
								)}
								title={isSidebarCollapsed ? label : undefined}
							>
								<Icon name={iconName} className="h-4 w-4 shrink-0" />
								<AnimatePresence mode="wait">
									{!isSidebarCollapsed && (
										<motion.span
											className="text-sm"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{ duration: 0.15 }}
										>
											{label}
										</motion.span>
									)}
								</AnimatePresence>
							</Link>
						);
					})}

					{/* Animated background */}
					<AnimatePresence>
						{rect && (
							<motion.div
								className="absolute top-0 left-0 rounded-lg border border-stroke-soft-200 bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0),
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0),
									opacity: 1,
								}}
								exit={{
									pointerEvents: "none",
									opacity: 0,
								}}
								transition={{ duration: 0.14 }}
							/>
						)}
					</AnimatePresence>
				</div>
			</div>
			<div className="border-stroke-soft-100 border-t p-2">
				<div
					className={cn(
						"flex items-center gap-2 rounded-lg p-1.5 hover:bg-neutral-alpha-5",
						isSidebarCollapsed ? "justify-center" : "justify-start",
					)}
				>
					<Avatar.Root color="purple" size="16" placeholderType="company" />
					<AnimatePresence mode="wait">
						{!isSidebarCollapsed && (
							<motion.div
								className="min-w-0 flex-1"
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								transition={{ duration: 0.15 }}
							>
								<p className="truncate font-medium text-sm text-text-strong-950">
									User Name
								</p>
								<p className="truncate text-text-sub-600 text-xs">
									user@example.com
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};
