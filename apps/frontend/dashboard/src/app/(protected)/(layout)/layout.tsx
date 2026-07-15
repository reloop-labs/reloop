"use client";

import { Loader } from "@dot-loaders/react";
import { CommandMenuGlobal } from "@fe/dashboard/components/command-menu";
import { AiPanel } from "@fe/dashboard/components/layout/ai-panel";
import { PageHeader } from "@fe/dashboard/components/layout/page-header";
import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";
import {
	UserOrganizationProvider,
	useUserOrganization,
} from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { AnimatePresence } from "framer-motion";

const DashboardLayoutContent = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { isAiPanelOpen } = useUIStore();
	const { user, isLoading, organizations, activeOrganization } =
		useUserOrganization();

	// Orgless users must not see dashboard pages while redirecting to
	// onboarding or invites (provider handles navigation).
	const orgsResolved = organizations !== undefined;
	const hasOrg = (organizations?.length ?? 0) > 0 && activeOrganization != null;
	const blockContent = isLoading || !user || (orgsResolved && !hasOrg);

	return (
		<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
			<MainSidebar />
			<main className="relative m-2 flex flex-1 overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<div className="flex flex-1 flex-col overflow-hidden">
					<PageHeader />
					<div className="flex-1 overflow-y-auto">
						{blockContent ? (
							<>
								<div className="flex h-full w-full items-center justify-center text-text-strong-950 dark:text-white">
									<Loader loader="pulse" />
								</div>
								<div style={{ display: "none" }}>{children}</div>
							</>
						) : (
							children
						)}
					</div>
				</div>
				<AnimatePresence>{isAiPanelOpen && <AiPanel />}</AnimatePresence>
			</main>
		</div>
	);
};

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider alwaysRender>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
			<CommandMenuGlobal />
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
