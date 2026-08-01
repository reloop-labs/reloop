"use client";

import { AdminSidebar } from "@fe/console/components/admin-sidebar";
import { CommandPalette } from "@fe/console/components/command-palette";
import { ImpersonationBanner } from "@fe/console/components/impersonation-banner";
import { PlatformAdminProvider } from "@fe/console/providers/platform-admin-provider";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";

function TopChrome() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<div className="flex h-12 shrink-0 items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 dark:border-stroke-soft-100/40">
			<div className="min-w-0">
				<p className="truncate font-medium text-[13px] text-text-strong-950">
					Operator workspace
				</p>
				<p className="truncate text-[11px] text-text-sub-600">
					Search anything with ⌘K · Open full hubs, not fragments
				</p>
			</div>
			<div className="flex items-center gap-2">
				<CommandPalette />
				<button
					type="button"
					onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
					className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
					title="Toggle theme"
				>
					<Icon
						name={resolvedTheme === "dark" ? "sun" : "moon"}
						className="h-4 w-4"
					/>
				</button>
			</div>
		</div>
	);
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
	return (
		<PlatformAdminProvider>
			<div className="flex h-dvh flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<ImpersonationBanner />
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<AdminSidebar />
					<main className="relative m-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<TopChrome />
						<div className="flex-1 overflow-y-auto p-5 md:p-7">{children}</div>
					</main>
				</div>
			</div>
		</PlatformAdminProvider>
	);
}
