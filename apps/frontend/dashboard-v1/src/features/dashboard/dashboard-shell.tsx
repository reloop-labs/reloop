import type { ReactNode } from "react";
import { PageHeader } from "./page-header/page-header";
import { MainSidebar } from "./sidebar/main-sidebar";

/**
 * App chrome for authenticated dashboard pages.
 * Matches Next dashboard layout: weak outer bg, sidebar, top bar, rounded main panel.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
			<MainSidebar />
			<main className="relative m-2 flex flex-1 overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<div className="flex flex-1 flex-col overflow-hidden">
					<PageHeader />
					<div className="flex-1 overflow-y-auto">{children}</div>
				</div>
			</main>
		</div>
	);
}
