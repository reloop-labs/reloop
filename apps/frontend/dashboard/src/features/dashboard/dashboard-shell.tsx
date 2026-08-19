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

function useIsAgentMailbox() {
	const pathname = usePathname();
	return Boolean(pathname.match(/\/inbox\/[^/]+/));
}

function useIsTemplateEditor() {
	const pathname = usePathname();
	if (pathname.includes("/templates/new")) return false;
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
	const isAgentMailbox = useIsAgentMailbox();
	const isTemplateEditor = useIsTemplateEditor();
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);

	if (isAgentMailbox) {
		return (
			<div className="flex h-screen flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
				{children}
			</div>
		);
	}

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
						<div className="flex-1 overflow-y-auto">{children}</div>
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
