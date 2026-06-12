"use client";

import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabColors: Record<string, string> = {
	Documentation: "#3b82f6",
	"API Reference": "#10b981",
	"Build with AI": "#8b5cf6",
	"Knowledge Base": "#f59e0b",
	Webhooks: "#ec4899",
	Setup: "#14b8a6",
};

export function Navbar({
	onMobileMenuClick,
}: {
	onMobileMenuClick: () => void;
}) {
	const pathname = usePathname();
	const tabs = navigationTabs;
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);

	const activeTab =
		tabs.find((tab) =>
			tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url),
		)?.title || null;

	const currentHighlighted = hoveredTab || activeTab;

	return (
		<div className="flex h-full w-full items-center justify-between pr-3">
			{/* Mobile Menu Placeholder / Logo on Mobile */}
			<div className="flex items-center gap-4 lg:hidden">
				<button
					type="button"
					onClick={onMobileMenuClick}
					className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					<Icon name="menu-2" className="h-5 w-5" />
				</button>
				<Link href="/" className="flex items-center lg:hidden">
					<Logo theme="light" className="w-10" />
				</Link>
			</div>

			{/* Nav tabs */}
			<div className="flex flex-1 h-full items-center">
				<nav
					className="hidden h-full items-center gap-0 lg:flex"
					onPointerLeave={() => setHoveredTab(null)}
				>
					{tabs.map((tab) => {
						const active =
							tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url);
						const color = tabColors[tab.title] || "#d97757";

						return (
							<Link
								key={tab.title}
								href={tab.url}
								className={cn(
									"relative flex h-full items-center gap-1.5 whitespace-nowrap px-4 font-semibold text-[13px] transition-colors duration-200",
									active || hoveredTab === tab.title
										? ""
										: "text-text-sub-600 dark:text-white/60",
								)}
								style={{
									color: (active || hoveredTab === tab.title) ? color : undefined,
								}}
								onPointerEnter={() => setHoveredTab(tab.title)}
							>
								{/* Shared sliding hover/active pill background */}
								{currentHighlighted === tab.title && (
									<motion.div
										layoutId="nav-pill"
										className="absolute inset-y-2 inset-x-1 -z-10 rounded-lg"
										style={{
											backgroundColor: active
												? `color-mix(in srgb, ${color} 12%, transparent)`
												: `color-mix(in srgb, ${color} 8%, transparent)`,
										}}
										transition={{ type: "spring", stiffness: 350, damping: 30 }}
									/>
								)}

								{/* Active bottom underline */}
								{active && (
									<motion.div
										layoutId="nav-active-underline"
										className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full"
										style={{ backgroundColor: color }}
										transition={{ type: "spring", stiffness: 350, damping: 30 }}
									/>
								)}

								<Icon
									name={tab.iconName}
									className={cn(
										"h-4 w-4 shrink-0 transition-colors duration-200",
										active || hoveredTab === tab.title ? "opacity-100" : "opacity-60",
									)}
									style={{ color: (active || hoveredTab === tab.title) ? color : undefined }}
								/>
								<span className="relative z-10">{tab.title}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<div className="flex items-center gap-3">
					<Link
						href="https://dashboard.reloop.sh/login"
						className="hidden font-medium text-sm text-text-sub-600 transition-colors hover:text-[#171717] sm:block dark:hover:text-white"
					>
						Sign In
					</Link>
					<Link
						href="https://dashboard.reloop.sh/signup"
						className="inline-flex h-9 items-center justify-center rounded-full bg-[#171717] px-5 font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-black"
					>
						{/* Shorten text on very small screens */}
						<span className="xs:inline hidden">Get Started</span>
						<span className="xs:hidden">Start</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
