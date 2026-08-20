"use client";

import { authClient } from "@reloop/auth/client";
import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdKey } from "@reloop/ui/kbd-key";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { normalizeDocsPathname } from "../../lib/is-active";

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey
			className={cn(
				"h-4 min-w-3.5 select-none items-center justify-center rounded-[4px] border border-stroke-soft-200 bg-bg-weak-50 px-1 font-medium font-mono text-[9px] text-text-sub-600 leading-none shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
				className,
			)}
		>
			{children}
		</KbdKey>
	);
}

const tabColors: Record<string, string> = {
	Documentation: "#3b82f6",
	"API Reference": "#8b5cf6",
	Guides: "#f59e0b",
	Webhooks: "#ec4899",
	"Self-Hosted": "#0ea5e9",
	Setup: "#10b981",
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
		<div className="flex h-full w-full min-w-0 items-center justify-between gap-2 px-3">
			{/* Mobile — match dashboard brand lockup */}
			<div className="flex shrink-0 items-center gap-2 lg:hidden">
				<button
					type="button"
					onClick={onMobileMenuClick}
					className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
					aria-label="Open navigation menu"
				>
					<Icon name="menu-2" className="h-4 w-4" />
				</button>
				<a href="/" className="flex items-center gap-2">
					<Logo className="-ml-1 w-10 shrink-0" />
					<p className="-ml-2 font-semibold text-text-strong-950 dark:text-white">
						Reloop
					</p>
					<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
						Beta
					</span>
				</a>
			</div>

			{/* Desktop tabs */}
			<div className="hidden min-w-0 flex-1 items-center lg:flex">
				<nav
					className="flex h-full min-w-0 max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

						return (
							<Link
								key={tab.title}
								href={tab.url}
								className={cn(
									"relative flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-semibold text-xs no-underline transition-colors",
									active
										? ""
										: "text-text-sub-600 hover:text-[#171717] dark:text-white/60 dark:hover:text-white",
								)}
								style={active ? { color } : undefined}
							>
								{active && (
									<span
										aria-hidden
										className="pointer-events-none absolute inset-0 rounded-full"
										style={{
											backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
										}}
									/>
								)}
								<span
									className={cn(
										"relative inline-flex size-3.5 shrink-0 items-center justify-center",
										!active && "opacity-60",
									)}
								>
									<svg
										viewBox="0 0 24 24"
										className="size-3.5 fill-current"
										aria-hidden
									>
										<title>{tab.title}</title>
										<use href={`#${tab.iconName}`} />
									</svg>
								</span>
								<span className="relative">{tab.title}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
				<Link
					href="https://github.com/reloop-labs/reloop"
					target="_blank"
					rel="noreferrer"
					className="hidden h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600 transition-colors hover:text-[#171717] sm:inline-flex 2xl:hidden dark:hover:text-white"
					title="GitHub"
					aria-label="GitHub"
				>
					<Icon name="social-github" className="h-3.5 w-3.5 shrink-0" />
				</Link>
				<Link
					href="https://github.com/reloop-labs/reloop"
					target="_blank"
					rel="noreferrer"
					className="hidden h-7 items-center gap-1.5 px-2.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-[#171717] 2xl:inline-flex dark:hover:text-white"
					title="GitHub"
				>
					<Icon name="social-github" className="h-3.5 w-3.5 shrink-0" />
					<span className="max-w-[6.5rem] truncate">{stars}</span>
				</Link>
				{mounted && !isPending && session ? (
					<FancyButton.Root
						asChild
						variant="neutral"
						size="xsmall"
						className="h-7! px-3! font-semibold! text-xs!"
					>
						<a href="/dashboard">Dashboard</a>
					</FancyButton.Root>
				) : (
					<FancyButton.Root
						asChild
						variant="neutral"
						size="xsmall"
						className="h-7! px-3! font-semibold! text-xs!"
					>
						<a href="/dashboard">Get Started</a>
					</FancyButton.Root>
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
			<div className="h-7 w-7 shrink-0 animate-pulse rounded-lg border border-stroke-soft-100 bg-bg-white-0/50 dark:bg-white/5" />
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 transition-transform hover:scale-105 hover:text-[#171717] active:scale-95 dark:hover:bg-white/5 dark:hover:text-white"
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
		>
			<Icon name={isDark ? "sun" : "moon"} className="h-3.5 w-3.5" />
		</button>
	);
}
