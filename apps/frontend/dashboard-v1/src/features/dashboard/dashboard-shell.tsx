import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageHeader } from "./page-header/page-header";
import { MainSidebar } from "./sidebar/main-sidebar";

/**
 * Full-screen template editor lives at /templates/$templateId
 * (matches Next: outside the main layout chrome).
 */
function useIsTemplateEditor() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	// /templates or /templates/ → list; /templates/<id> → editor
	return Boolean(pathname.match(/\/templates\/[^/]+/));
}

/**
 * Full-screen agent mailbox UI lives at /inbox/$mailboxId/*
 * (matches Next: fixed overlay outside the main layout chrome).
 */
function useIsAgentMailbox() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return Boolean(pathname.match(/\/inbox\/[^/]+/));
}

/**
 * App chrome for authenticated dashboard pages.
 * Matches Next dashboard layout: weak outer bg, sidebar, top bar, rounded main panel.
 * Template editor and agent mailbox get a full-viewport shell without sidebar/header.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
	const isTemplateEditor = useIsTemplateEditor();
	const isAgentMailbox = useIsAgentMailbox();

	if (isTemplateEditor || isAgentMailbox) {
		return (
			<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				{children}
			</div>
		);
	}

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
