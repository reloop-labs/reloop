import { PageHeader } from "@fe/dashboard/components/layout/page-header";
import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";

import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="flex min-h-screen">
				<MainSidebar />
				<main className="relative flex-1">
					<PageHeader />
					{children}
					<Toaster />
				</main>
			</div>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
