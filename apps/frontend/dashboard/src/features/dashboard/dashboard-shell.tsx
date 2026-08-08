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

/**
 * Full-screen template editor lives at /templates/$templateId
 * (matches Next: outside the main layout chrome).
 */
function useIsTemplateEditor() {
	const pathname = usePathname();
	// /templates or /templates/ → list; /templates/<id> → editor
	return Boolean(pathname.match(/\/templates\/[^/]+/));
}

/**
 * Full-screen agent mailbox UI lives at /inbox/$mailboxId/*
 * (matches Next: fixed overlay outside the main layout chrome).
 */
function useIsAgentMailbox() {
	const pathname = usePathname();
	return Boolean(pathname.match(/\/inbox\/[^/]+/));
}

/**
 * App chrome for authenticated dashboard pages.
 * Matches Next dashboard layout: weak outer bg, sidebar, top bar, rounded main panel.
 * Template editor and agent mailbox get a full-viewport shell without sidebar/header.
 * Support slide-in panel mounts beside the main content.
 * (Ask AI is hidden until assistant API integration.)
 */
export function DashboardShell({ children }: { children: ReactNode }) {
	const isTemplateEditor = useIsTemplateEditor();
	const isAgentMailbox = useIsAgentMailbox();
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);

	if (isTemplateEditor) {
		return (
			<CommandMenuProvider>
				<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
					{children}
					<CommandMenuGlobal />
				</div>
			</CommandMenuProvider>
		);
	}

	// Agent mailbox owns ⌘K via InboxCommandPalette — no global command menu.
	if (isAgentMailbox) {
		return (
			<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				{children}
			</div>
		);
	}

	return (
		<CommandMenuProvider>
			<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
				<OpenSupportFromQuery />
				<MainSidebar />
				<main className="relative m-2 flex flex-1 overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
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
