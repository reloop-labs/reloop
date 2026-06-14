"use client";

import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const DynamicActivePill = dynamic(
	() => import("./navbar-animations").then((mod) => mod.ActivePill),
	{ ssr: false },
);

const DynamicActiveUnderline = dynamic(
	() => import("./navbar-animations").then((mod) => mod.ActiveUnderline),
	{ ssr: false },
);

const tabColors: Record<string, string> = {
	Documentation: "#3b82f6",
	"API Reference": "#8b5cf6",
	Webhooks: "#ec4899",
	"Self-Hosted": "#0ea5e9",
};

export function Navbar({
	onMobileMenuClick,
	onSearchClick,
}: {
	onMobileMenuClick: () => void;
	onSearchClick?: () => void;
}) {
	const pathname = usePathname();
	const tabs = navigationTabs;
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTab =
		tabs.find((tab) => {
			if (tab.url === "/") {
				return !tabs
					.filter((t) => t.url !== "/")
					.some((t) => pathname.startsWith(t.url));
			}
			return pathname.startsWith(tab.url);
		})?.title || "Documentation";

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
				<a href="/" className="flex items-center lg:hidden">
					<Logo className="h-10 w-10" />
				</a>
			</div>

			{/* Nav tabs */}
			<div className="flex h-full flex-1 items-center">
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
									color: active || hoveredTab === tab.title ? color : undefined,
								}}
								onPointerEnter={() => setHoveredTab(tab.title)}
							>
								{/* Pill background */}
								{currentHighlighted === tab.title &&
									(mounted ? (
										<DynamicActivePill color={color} active={active} />
									) : (
										<div
											className="-z-10 absolute inset-x-1 inset-y-2 rounded-lg transition-all duration-200"
											style={{
												backgroundColor: active
													? `color-mix(in srgb, ${color} 12%, transparent)`
													: `color-mix(in srgb, ${color} 8%, transparent)`,
											}}
										/>
									))}

								{/* Active bottom underline */}
								{active &&
									(mounted ? (
										<DynamicActiveUnderline color={color} />
									) : (
										<div
											className="absolute right-1 bottom-0 left-1 h-[2px] rounded-full"
											style={{ backgroundColor: color }}
										/>
									))}

								<Icon
									name={tab.iconName}
									className={cn(
										"h-4 w-4 shrink-0 transition-colors duration-200",
										active || hoveredTab === tab.title
											? "opacity-100"
											: "opacity-60",
									)}
									style={{
										color:
											active || hoveredTab === tab.title ? color : undefined,
									}}
								/>
								<span className="relative z-10">{tab.title}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<div className="flex items-center gap-2">
					{onSearchClick && (
						<button
							type="button"
							onClick={onSearchClick}
							className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 text-xs transition-all hover:scale-[1.02] hover:border-black/15 hover:text-[#171717] active:scale-[0.98] sm:w-48 sm:justify-between sm:px-3 dark:hover:border-white/15 dark:hover:text-white"
							title="Search (⌘K)"
						>
							<div className="flex items-center gap-1.5">
								<Icon name="search" className="h-4 w-4 shrink-0" />
								<span className="hidden text-left sm:inline-block">
									Search...
								</span>
							</div>
							<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-stroke-soft-100 bg-bg-weak-50 px-1.5 font-medium font-mono text-[9px] leading-none sm:inline-flex">
								<span className="text-[10px]">⌘</span>K
							</kbd>
						</button>
					)}
					<Link
						href="https://github.com/reloop-labs/reloop"
						target="_blank"
						rel="noreferrer"
						className="hidden items-center gap-1.5 font-medium text-sm text-text-sub-600 transition-colors hover:text-[#171717] sm:flex dark:hover:text-white"
					>
						<Icon name="social-github" className="h-4 w-4 shrink-0" />
						GitHub
					</Link>
					<a
						href="/dashboard"
						className="ml-2 inline-flex h-9 items-center justify-center rounded-full bg-[#171717] px-5 font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-black"
					>
						Get Started
					</a>
					<ThemeToggle />
				</div>
			</div>
		</div>
	);
}

function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="h-9 w-9 animate-pulse rounded-full border border-stroke-soft-100 bg-bg-white-0/50 dark:bg-white/5" />
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke-soft-100 transition-transform hover:scale-105 hover:text-[#171717] active:scale-95 dark:hover:bg-white/5 dark:hover:text-white"
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
		>
			<Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
		</button>
	);
}
