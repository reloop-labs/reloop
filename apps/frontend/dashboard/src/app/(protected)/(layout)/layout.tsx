"use client";

import { ChatwootUserSync } from "@fe/dashboard/components/chatwoot-widget";
import { AiPanel } from "@fe/dashboard/components/layout/ai-panel";
import { PageHeader } from "@fe/dashboard/components/layout/page-header";
import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	const { isAiPanelOpen } = useUIStore();

	return (
		<UserOrganizationProvider>
			<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
				<MainSidebar />
				<main className="relative mt-2 mr-2 flex flex-1 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<div className="flex flex-1 flex-col overflow-hidden">
						<PageHeader />
						<div className="flex-1 overflow-y-auto">{children}</div>
					</div>
					{isAiPanelOpen && <AiPanel />}
				</main>
			</div>
			<ChatwootUserSync />
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
