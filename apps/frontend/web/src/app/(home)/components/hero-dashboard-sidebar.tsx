"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export interface NavItem {
	id: string;
	label: string;
	icon: string;
}

export interface NavGroup {
	section: string;
	items: NavItem[];
}

export const NAV_SECTIONS: NavGroup[] = [
	{
		section: "Main",
		items: [
			{ id: "emails", label: "Emails", icon: "mail-single" },
			{ id: "inbox", label: "Inbox", icon: "inbox" },
		],
	},
	{
		section: "Messaging",
		items: [
			{ id: "contacts", label: "Contacts", icon: "contacts" },
			{ id: "templates", label: "Templates", icon: "layout" },
			{ id: "workflow", label: "Workflows", icon: "workflow" },
		],
	},
	{
		section: "Analytics",
		items: [
			{ id: "metrics", label: "Metrics", icon: "fat-row" },
			{ id: "logs", label: "Logs", icon: "logs" },
		],
	},
	{
		section: "Developer",
		items: [
			{ id: "api-keys", label: "API Keys", icon: "key-new" },
			{ id: "domain", label: "Domain", icon: "globe" },
			{ id: "webhooks", label: "Webhooks", icon: "webhook" },
			{ id: "integrations", label: "Integrations", icon: "integration" },
			{ id: "smtp", label: "SMTP", icon: "smtp" },
		],
	},
	{
		section: "Settings",
		items: [{ id: "settings", label: "Settings", icon: "gear" }],
	},
];

export function HeroDashboardSidebar({
	activeItem = "emails",
	onItemClick,
}: {
	activeItem?: string;
	onItemClick?: (id: string) => void;
}) {
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const reduceMotion = useReducedMotion();

	return (
		<aside className="hidden h-full w-[13.5rem] shrink-0 flex-col border-stroke-soft-200 border-r bg-bg-white-0 md:flex dark:border-white/10 dark:bg-[#0a0a0a]">
			<div className="flex h-11 shrink-0 items-center gap-1.5 px-3">
				<Logo className="-ml-0.5 w-8" />
				<span className="-ml-1 font-semibold text-[13px] text-text-strong-950 dark:text-white">
					Reloop
				</span>
				<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
					Beta
				</span>
			</div>
			<nav
				className="min-h-0 flex-1 overflow-hidden px-2 pb-3"
				onMouseLeave={() => setHoveredId(null)}
			>
				{NAV_SECTIONS.map((group, groupIndex) => (
					<div key={group.section}>
						<p
							className={cn(
								"px-2.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
								groupIndex === 0 ? "pt-1" : "pt-3",
							)}
						>
							{group.section}
						</p>
						<ul className="flex flex-col gap-0.5">
							{group.items.map((item) => {
								const active = item.id === activeItem;
								const isHovered = item.id === hoveredId;

								return (
									<li key={item.id} className="relative">
										<button
											type="button"
											onClick={() => onItemClick?.(item.id)}
											onMouseEnter={() => setHoveredId(item.id)}
											className="group relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left"
										>
											{/* Moving active indicator */}
											{active && (
												<motion.div
													layoutId={
														reduceMotion ? undefined : "sidebar-active-indicator"
													}
													className="absolute inset-0 rounded-lg bg-bg-weak-50 dark:bg-white/[0.06]"
													transition={
														reduceMotion
															? { duration: 0 }
															: {
																	type: "spring",
																	stiffness: 400,
																	damping: 32,
																}
													}
												/>
											)}

											{/* Moving sliding hover pill */}
											<AnimatePresence>
												{isHovered && !active && (
													<motion.div
														layoutId={
															reduceMotion
																? undefined
																: "sidebar-hover-indicator"
														}
														className="absolute inset-0 rounded-lg bg-bg-weak-50/70 dark:bg-white/[0.04]"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														transition={
															reduceMotion
																? { duration: 0 }
																: {
																		type: "spring",
																		stiffness: 400,
																		damping: 30,
																	}
														}
													/>
												)}
											</AnimatePresence>

											<Icon
												name={item.icon}
												className={cn(
													"relative z-10 size-4 shrink-0 transition-colors duration-150",
													active
														? "text-text-strong-950 dark:text-white"
														: isHovered
															? "text-text-strong-950 dark:text-white"
															: "text-text-sub-600 dark:text-white/60",
												)}
											/>
											<span
												className={cn(
													"relative z-10 truncate font-medium text-[13px] transition-colors duration-150",
													active
														? "text-text-strong-950 dark:text-white"
														: isHovered
															? "text-text-strong-950 dark:text-white"
															: "text-text-sub-600 dark:text-white/60",
												)}
											>
												{item.label}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}
