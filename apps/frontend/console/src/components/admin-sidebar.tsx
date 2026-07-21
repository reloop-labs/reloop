"use client";

import { ADMIN_NAV_GROUPS } from "@fe/console/constants/navigation";
import { useSupportUnread } from "@fe/console/hooks/use-support-unread";
import { usePlatformAdmin } from "@fe/console/providers/platform-admin-provider";
import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop-console-sidebar-collapsed";

export function AdminSidebar() {
	const pathname = usePathname();
	const { user } = usePlatformAdmin();
	const { unreadCount } = useSupportUnread();
	const [collapsed, setCollapsed] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "1") setCollapsed(true);
		} catch {
			// ignore
		}
		setHydrated(true);
	}, []);

	const toggle = () => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
			} catch {
				// ignore
			}
			return next;
		});
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				toggle();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

	if (!hydrated) {
		return <aside className="h-full w-[68px] shrink-0" aria-hidden />;
	}

	return (
		<aside
			className={cn(
				"sticky top-0 z-10 flex h-full flex-col transition-[width] duration-200 ease-in-out select-none",
				collapsed ? "w-[68px]" : "w-[240px]",
			)}
		>
			<div
				className={cn(
					"flex h-14 items-center",
					collapsed ? "justify-center px-0" : "justify-between px-3",
				)}
			>
				{collapsed ? (
					<button
						type="button"
						onClick={toggle}
						title="Expand sidebar (⌘B)"
						className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-bg-weak-50 dark:hover:bg-white/5"
					>
						<Logo className="h-7 w-7" />
					</button>
				) : (
					<>
						<div className="flex min-w-0 items-center gap-2">
							<Logo className="h-8 w-8 shrink-0" />
							<div className="min-w-0">
								<p className="truncate font-semibold text-[13px] text-text-strong-950 leading-tight">
									Reloop
								</p>
								<p className="truncate font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
									Platform console
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={toggle}
							title="Collapse sidebar (⌘B)"
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Icon name="sidebar-left" className="h-4 w-4" />
						</button>
					</>
				)}
			</div>

			<nav
				className={cn(
					"flex-1 space-y-4 overflow-y-auto overflow-x-hidden py-1",
					collapsed ? "px-2" : "px-2.5",
				)}
			>
				{ADMIN_NAV_GROUPS.map((group) => (
					<div key={group.label}>
						{!collapsed ? (
							<p className="mb-1.5 px-2 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.08em]">
								{group.label}
							</p>
						) : (
							<div className="mx-auto mb-1.5 h-px w-6 bg-stroke-soft-100 dark:bg-white/10" />
						)}
						<div className="space-y-0.5">
							{group.items.map((item) => {
								const active = isActive(item.href);
								const showBadge = item.href === "/support" && unreadCount > 0;
								return (
									<Link
										key={item.href}
										href={item.href}
										title={collapsed ? item.label : item.description}
										className={cn(
											"group relative flex items-center rounded-xl transition-colors",
											collapsed
												? "h-10 w-10 justify-center mx-auto"
												: "gap-2.5 px-2.5 py-2",
											active
												? "bg-bg-white-0 text-text-strong-950 shadow-sm ring-1 ring-stroke-soft-100 dark:bg-white/[0.06] dark:ring-white/10"
												: "text-text-sub-600 hover:bg-bg-white-0/70 hover:text-text-strong-950 dark:hover:bg-white/[0.04]",
										)}
									>
										<span className="relative">
											<Icon
												name={item.iconName}
												className={cn(
													"h-4 w-4 shrink-0",
													active
														? "text-text-strong-950"
														: "text-text-sub-600 opacity-80 group-hover:opacity-100",
												)}
											/>
											{showBadge && collapsed ? (
												<span className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-orange-500" />
											) : null}
										</span>
										{!collapsed ? (
											<>
												<span className="min-w-0 flex-1 truncate font-medium text-[13px]">
													{item.label}
												</span>
												{showBadge ? (
													<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 font-semibold text-[10px] text-white">
														{unreadCount > 99 ? "99+" : unreadCount}
													</span>
												) : null}
											</>
										) : null}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			<div
				className={cn(
					"border-stroke-soft-100/80 border-t py-3 dark:border-white/10",
					collapsed ? "px-2" : "px-3",
				)}
			>
				{collapsed ? (
					<button
						type="button"
						onClick={() => authClient.signOut()}
						title="Sign out"
						className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950 dark:hover:bg-white/5"
					>
						<Icon name="logout" className="h-4 w-4" />
					</button>
				) : (
					<div className="space-y-2">
						<div className="rounded-xl bg-bg-white-0/70 px-2.5 py-2 ring-1 ring-stroke-soft-100 dark:bg-white/[0.04] dark:ring-white/10">
							<p className="truncate font-medium text-[12px] text-text-strong-950">
								{user?.name || "Platform admin"}
							</p>
							<p className="truncate text-[11px] text-text-sub-600">
								{user?.email}
							</p>
						</div>
						<button
							type="button"
							onClick={() => authClient.signOut()}
							className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Icon name="logout" className="h-4 w-4" />
							Sign out
						</button>
					</div>
				)}
			</div>
		</aside>
	);
}
