"use client";

import { authClient } from "@reloop/auth/client";
import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { normalizeDocsPathname } from "../../lib/is-active";

const tabColors: Record<string, string> = {
	Documentation: "#3b82f6",
	"API Reference": "#8b5cf6",
	Guides: "#f59e0b",
	Webhooks: "#ec4899",
	"Self-Hosted": "#0ea5e9",
	Setup: "#10b981",
};

/** Short labels for mid-width desktops where full titles overflow. */
const tabShortTitles: Record<string, string> = {
	Documentation: "Docs",
	"API Reference": "API",
	Guides: "Guides",
	Webhooks: "Webhooks",
	"Self-Hosted": "Self-host",
	Setup: "Setup",
};

export function Navbar({
	onMobileMenuClick,
	onSearchClick,
}: {
	onMobileMenuClick: () => void;
	onSearchClick?: () => void;
}) {
	const pathname = normalizeDocsPathname(usePathname());
	const tabs = navigationTabs;
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<string>("GitHub");

	useEffect(() => {
		setMounted(true);

		fetch("https://api.github.com/repos/reloop-labs/reloop")
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.stargazers_count === "number") {
					const count = data.stargazers_count;
					if (count >= 1000) {
						setStars(`${(count / 1000).toFixed(1)}k stars`);
					} else {
						setStars(`${count} stars`);
					}
				}
			})
			.catch(() => {});
	}, []);

	return (
		<div className="flex h-full min-w-0 w-full items-center justify-between gap-2 pr-2 sm:pr-3">
			{/* Mobile Menu Placeholder / Logo on Mobile */}
			<div className="flex shrink-0 items-center gap-2 lg:hidden">
				<button
					type="button"
					onClick={onMobileMenuClick}
					className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
					aria-label="Open navigation menu"
				>
					<Icon name="menu-2" className="h-5 w-5" />
				</button>
				<a href="/" className="flex items-center lg:hidden">
					<Logo className="size-10 sm:size-11" />
				</a>
			</div>

			{/* Nav tabs — scrollable if still tight; compact until xl */}
			<div className="hidden min-w-0 flex-1 items-center lg:flex">
				<nav
					className={cn(
						"flex h-full min-w-0 max-w-full items-center",
						"overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					)}
					aria-label="Documentation sections"
				>
					{tabs.map((tab) => {
						const active =
							tab.url === "/"
								? !tabs
										.filter((t) => t.url !== "/")
										.some((t) => pathname.startsWith(t.url))
								: pathname.startsWith(tab.url);
						const color = tabColors[tab.title] || "#d97757";
						const shortTitle = tabShortTitles[tab.title] ?? tab.title;

						return (
							<Link
								key={tab.title}
								href={tab.url}
								title={tab.title}
								className={cn(
									"relative flex h-full shrink-0 items-center gap-1 whitespace-nowrap font-semibold",
									"px-2 text-[12px] xl:gap-1.5 xl:px-3 xl:text-[13px] 2xl:px-4",
									active ? "" : "text-text-sub-600 dark:text-white/60",
								)}
								style={{
									color: active ? color : undefined,
								}}
							>
								{active && (
									<div
										className="-z-10 absolute inset-x-0.5 inset-y-2 rounded-full xl:inset-x-1"
										style={{
											backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
										}}
									/>
								)}

								<Icon
									name={tab.iconName}
									className={cn(
										"h-3.5 w-3.5 shrink-0 xl:h-4 xl:w-4",
										active ? "opacity-100" : "opacity-60",
									)}
									style={{
										color: active ? color : undefined,
									}}
								/>
								{/* Full title from xl; short label between lg and xl */}
								<span className="relative z-10 hidden xl:inline">
									{tab.title}
								</span>
								<span className="relative z-10 xl:hidden">{shortTitle}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
				{onSearchClick && (
					<button
						type="button"
						onClick={onSearchClick}
						className={cn(
							"flex h-9 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 text-xs transition-all",
							"w-9 hover:scale-[1.02] hover:border-black/15 hover:text-[#171717] active:scale-[0.98]",
							"dark:hover:border-white/15 dark:hover:text-white",
							// Expand search field only when there is room
							"xl:w-44 xl:justify-between xl:px-3 2xl:w-52",
						)}
						title="Search (⌘K)"
					>
						<div className="flex items-center gap-1.5">
							<Icon name="search" className="h-4 w-4 shrink-0" />
							<span className="hidden text-left xl:inline-block">
								Search...
							</span>
						</div>
						<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-stroke-soft-100 bg-bg-weak-50 px-1.5 font-medium font-mono text-[9px] leading-none xl:inline-flex">
							<span className="text-[10px]">⌘</span>K
						</kbd>
					</button>
				)}
				<Link
					href="https://github.com/reloop-labs/reloop"
					target="_blank"
					rel="noreferrer"
					className="hidden items-center gap-1.5 font-medium text-sm text-text-sub-600 transition-colors hover:text-[#171717] 2xl:flex dark:hover:text-white"
					title="GitHub"
				>
					<Icon name="social-github" className="h-4 w-4 shrink-0" />
					<span className="max-w-[6.5rem] truncate">{stars}</span>
				</Link>
				{/* Icon-only GitHub between sm and 2xl so the repo stays reachable */}
				<Link
					href="https://github.com/reloop-labs/reloop"
					target="_blank"
					rel="noreferrer"
					className="hidden h-9 w-9 items-center justify-center rounded-full border border-stroke-soft-100 text-text-sub-600 transition-colors hover:text-[#171717] sm:flex 2xl:hidden dark:hover:text-white"
					title="GitHub"
					aria-label="GitHub"
				>
					<Icon name="social-github" className="h-4 w-4 shrink-0" />
				</Link>
				{mounted && !isPending && session ? (
					<a
						href="/dashboard"
						className="inline-flex h-9 items-center justify-center rounded-full bg-[#171717] px-3 font-semibold text-xs text-white transition-all hover:opacity-90 active:scale-[0.98] sm:px-4 sm:text-sm dark:bg-white dark:text-black xl:px-5"
					>
						Dashboard
					</a>
				) : (
					<a
						href="/dashboard"
						className="inline-flex h-9 items-center justify-center rounded-full bg-[#171717] px-3 font-semibold text-xs text-white transition-all hover:opacity-90 active:scale-[0.98] sm:px-4 sm:text-sm dark:bg-white dark:text-black xl:px-5"
					>
						<span className="sm:hidden">Start</span>
						<span className="hidden sm:inline">Get Started</span>
					</a>
				)}
				<ThemeToggle />
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
			<div className="h-9 w-9 shrink-0 animate-pulse rounded-full border border-stroke-soft-100 bg-bg-white-0/50 dark:bg-white/5" />
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 transition-transform hover:scale-105 hover:text-[#171717] active:scale-95 dark:hover:bg-white/5 dark:hover:text-white"
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
		>
			<Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
		</button>
	);
}
