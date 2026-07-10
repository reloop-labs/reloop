"use client";

import { ADMIN_NAV } from "@fe/console/constants/navigation";
import { useSupportUnread } from "@fe/console/hooks/use-support-unread";
import { usePlatformAdmin } from "@fe/console/providers/platform-admin-provider";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import { PanelLeft, PanelLeftClose } from "lucide-react";
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

	// Avoid flash of wrong state before localStorage read
	if (!hydrated) {
		return <aside className="h-full w-56 shrink-0" aria-hidden />;
	}

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={toggle}
				title="Open navigation"
				aria-label="Open navigation"
				className="absolute bottom-4 left-4 z-30 flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-black/5 hover:text-text-strong-950 dark:hover:bg-white/10"
			>
				<PanelLeft className="h-4 w-4" />
				{unreadCount > 0 ? (
					<span className="-top-1 -right-1 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-[9px] text-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				) : null}
			</button>
		);
	}

	return (
		<aside className="flex h-full w-56 shrink-0 flex-col border-stroke-soft-100 border-r bg-bg-white-0 px-3 py-4 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
			<div className="mb-6 flex items-center gap-2 px-2">
				<Logo className="h-8 shrink-0" />
				<div className="min-w-0">
					<p className="font-semibold text-label-sm text-text-strong-950">
						Reloop Console
					</p>
					<p className="text-[11px] text-text-sub-600">Platform console</p>
				</div>
			</div>
			<nav className="flex flex-1 flex-col gap-1">
				{ADMIN_NAV.map((item) => {
					const active =
						item.href === "/"
							? pathname === "/"
							: pathname.startsWith(item.href);
					const showBadge = item.href === "/support" && unreadCount > 0;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center justify-between rounded-xl px-3 py-2 font-medium text-label-sm transition-colors ${
								active
									? "bg-bg-weak-50 text-text-strong-950"
									: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
							}`}
						>
							<span>{item.label}</span>
							{showBadge ? (
								<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 font-semibold text-[10px] text-white">
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							) : null}
						</Link>
					);
				})}
			</nav>
			<div className="mt-auto space-y-2 border-stroke-soft-100 border-t pt-3">
				<p className="truncate px-2 text-[12px] text-text-sub-600">
					{user?.email}
				</p>
				<div className="flex items-center gap-1">
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="small"
						className="flex-1 justify-start"
						onClick={() => authClient.signOut()}
					>
						Sign out
					</Button.Root>
					<button
						type="button"
						onClick={toggle}
						title="Collapse navigation"
						aria-label="Collapse navigation"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						<PanelLeftClose className="h-4 w-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}
