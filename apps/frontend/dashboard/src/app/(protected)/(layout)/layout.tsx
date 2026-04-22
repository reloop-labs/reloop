import { PageHeader } from "@fe/dashboard/components/layout/page-header";
import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";
import { SidebarToggle } from "@fe/dashboard/components/layout/sidebar-toggel";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="flex h-screen overflow-hidden">
				<SidebarToggle />
				<MainSidebar />
				<main className="relative flex flex-1 flex-col overflow-y-hidden">
					<PageHeader />
					<div className="flex-1 overflow-y-auto">{children}</div>
					<Toaster />
				</main>
			</div>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
