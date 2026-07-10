"use client";

import { AdminSidebar } from "@fe/console/components/admin-sidebar";
import { ImpersonationBanner } from "@fe/console/components/impersonation-banner";
import { PlatformAdminProvider } from "@fe/console/providers/platform-admin-provider";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
	return (
		<PlatformAdminProvider>
			<div className="flex h-dvh flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<ImpersonationBanner />
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<AdminSidebar />
					<main className="m-2 flex flex-1 flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<div className="flex-1 overflow-y-auto p-6">{children}</div>
					</main>
				</div>
			</div>
		</PlatformAdminProvider>
	);
}
