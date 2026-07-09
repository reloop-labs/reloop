"use client";

import { ADMIN_NAV } from "@fe/console/constants/navigation";
import {
	usePlatformAdmin,
} from "@fe/console/providers/platform-admin-provider";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
	const pathname = usePathname();
	const { user } = usePlatformAdmin();

	return (
		<aside className="flex h-full w-56 flex-col border-stroke-soft-100 border-r bg-bg-white-0 px-3 py-4 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
			<div className="mb-6 flex items-center gap-2 px-2">
				<Logo className="h-8" />
				<div>
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
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`rounded-xl px-3 py-2 font-medium text-label-sm transition-colors ${
								active
									? "bg-bg-weak-50 text-text-strong-950"
									: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
							}`}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
			<div className="mt-auto space-y-2 border-stroke-soft-100 border-t pt-3">
				<p className="truncate px-2 text-[12px] text-text-sub-600">
					{user?.email}
				</p>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="small"
					className="w-full justify-start"
					onClick={() => authClient.signOut()}
				>
					Sign out
				</Button.Root>
			</div>
		</aside>
	);
}
