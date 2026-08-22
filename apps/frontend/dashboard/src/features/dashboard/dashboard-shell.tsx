import { cn } from "@reloop/ui/cn";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CommandMenuGlobal } from "#/features/dashboard/command-menu";
import { CommandMenuProvider } from "#/features/dashboard/command-menu-context";
import { AiPanel } from "#/features/dashboard/layout/ai-panel";
import { OpenSupportFromQuery } from "#/features/dashboard/open-support-from-query";
import { useUIStore } from "#/store/use-ui-store";
import { PageHeader } from "./page-header/page-header";
import { MainSidebar } from "./sidebar/main-sidebar";

function useIsTemplateEditor() {
	const pathname = usePathname();
	return Boolean(pathname.match(/\/templates\/[^/]+/));
}

/**
 * App chrome for authenticated dashboard pages.
 * Flush Vercel-style shell: shared page bg, sidebar rail border, top bar.
 * Agent mailbox and template editor get a full-viewport shell without global sidebar/header.
 * Support slide-in panel mounts beside the main content.
 * (Ask AI is hidden until assistant API integration.)
 */
export function DashboardShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isInbox = pathname === "/inbox" || pathname.startsWith("/inbox");
	const isTemplateEditor = useIsTemplateEditor();
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);

	if (isTemplateEditor) {
		return (
			<CommandMenuProvider>
				<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
					<OpenSupportFromQuery />
					<MainSidebar />
					<main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
						{children}
					</main>
					<CommandMenuGlobal />
				</div>
			</CommandMenuProvider>
		);
	}

	return (
		<CommandMenuProvider>
			<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
				<OpenSupportFromQuery />
				<MainSidebar />
				<main className="relative flex min-w-0 flex-1 overflow-hidden">
					<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
						<PageHeader />
						<div
							className={cn(
								"flex-1",
								isInbox
									? "flex min-h-0 flex-col overflow-hidden"
									: "overflow-y-auto",
							)}
						>
							{children}
						</div>
					</div>
					<AnimatePresence>
						{isAiPanelOpen ? <AiPanel /> : null}
					</AnimatePresence>
				</main>
				<CommandMenuGlobal />
			</div>
		</CommandMenuProvider>
	);
}
