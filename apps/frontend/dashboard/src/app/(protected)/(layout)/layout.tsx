import { ChatwootUserSync } from "@fe/dashboard/components/chatwoot-widget";
import { PageHeader } from "@fe/dashboard/components/layout/page-header";
import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
				<MainSidebar />
				<main className="relative m-2 flex flex-1 flex-col overflow-y-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<PageHeader />
					<div className="flex-1 overflow-y-auto">{children}</div>
				</main>
			</div>
			<ChatwootUserSync />
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
