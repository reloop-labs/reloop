import { cn } from "@reloop/ui/cn";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { CommandMenuGlobal } from "#/features/dashboard/command-menu";
import { CommandMenuProvider } from "#/features/dashboard/command-menu-context";
import { AiPanel } from "#/features/dashboard/layout/ai-panel";
import { OpenSupportFromQuery } from "#/features/dashboard/open-support-from-query";
import { useUIStore } from "#/store/use-ui-store";
import { FloatingSupportButton } from "./floating-support-button";
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
function SidebarChrome({
	isMobileNavOpen,
	onCloseMobileNav,
}: {
	isMobileNavOpen: boolean;
	onCloseMobileNav: () => void;
}) {
	return (
		<>
			{isMobileNavOpen ? (
				<button
					type="button"
					aria-label="Close navigation"
					className="fixed inset-0 z-50 bg-black/50 lg:hidden"
					onClick={onCloseMobileNav}
				/>
			) : null}
			<div
				className={cn(
					isMobileNavOpen
						? "fixed inset-y-0 left-0 z-[60] flex h-dvh w-3/4 border-stroke-soft-100 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black"
						: "hidden",
					"lg:relative lg:inset-auto lg:z-10 lg:flex lg:h-auto lg:w-auto lg:bg-transparent",
				)}
			>
				<MainSidebar forceExpanded={isMobileNavOpen} />
			</div>
		</>
	);
}

export function DashboardShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isInbox = pathname === "/inbox" || pathname.startsWith("/inbox");
	const isTemplateEditor = useIsTemplateEditor();
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);
	const isMobileNavOpen = useUIStore((s) => s.isMobileNavOpen);
	const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

	useEffect(() => {
		setMobileNavOpen(false);
	}, [pathname, setMobileNavOpen]);

	if (isTemplateEditor) {
		return (
			<CommandMenuProvider>
				<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
					<OpenSupportFromQuery />
					<SidebarChrome
						isMobileNavOpen={isMobileNavOpen}
						onCloseMobileNav={() => setMobileNavOpen(false)}
					/>
					<main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
						{children}
					</main>
					<FloatingSupportButton />
					<CommandMenuGlobal />
				</div>
			</CommandMenuProvider>
		);
	}

	return (
		<CommandMenuProvider>
			<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
				<OpenSupportFromQuery />
				<SidebarChrome
					isMobileNavOpen={isMobileNavOpen}
					onCloseMobileNav={() => setMobileNavOpen(false)}
				/>
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
				<FloatingSupportButton />
				<CommandMenuGlobal />
			</div>
		</CommandMenuProvider>
	);
}
