import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
const DRAWER_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function SidebarChrome({
	isMobileNavOpen,
	onCloseMobileNav,
}: {
	isMobileNavOpen: boolean;
	onCloseMobileNav: () => void;
}) {
	const shouldReduceMotion = useReducedMotion();
	const reduce = Boolean(shouldReduceMotion);

	return (
		<>
			<div className="hidden lg:flex">
				<MainSidebar />
			</div>
			<AnimatePresence>
				{isMobileNavOpen ? (
					<motion.button
						key="mobile-nav-backdrop"
						type="button"
						aria-label="Close navigation"
						className="fixed inset-0 z-50 bg-black/50 lg:hidden"
						onClick={onCloseMobileNav}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={
							reduce ? { duration: 0 } : { duration: 0.2, ease: DRAWER_EASE }
						}
					/>
				) : null}
				{isMobileNavOpen ? (
					<motion.div
						key="mobile-nav-drawer"
						className="fixed inset-y-0 left-0 z-[60] flex h-dvh w-3/4 border-stroke-soft-100 border-r bg-bg-white-0 lg:hidden dark:border-stroke-soft-100/40 dark:bg-black"
						initial={reduce ? { x: 0 } : { x: "-100%" }}
						animate={{ x: 0 }}
						exit={reduce ? { x: 0 } : { x: "-100%" }}
						transition={
							reduce
								? { duration: 0 }
								: { type: "spring", bounce: 0, duration: 0.32 }
						}
					>
						<MainSidebar forceExpanded />
					</motion.div>
				) : null}
			</AnimatePresence>
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
				</main>
				<AnimatePresence>{isAiPanelOpen ? <AiPanel /> : null}</AnimatePresence>
				<FloatingSupportButton />
				<CommandMenuGlobal />
			</div>
		</CommandMenuProvider>
	);
}
