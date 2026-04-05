import { MainSidebar } from "@fe/dashboard/components/layout/sidebar";
import { CreateOrganizationModal } from "@fe/dashboard/components/organization/create-organization";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="flex min-h-screen">
				<MainSidebar />
				<main className="flex-1">
					{children}
					<CreateOrganizationModal />
					<Toaster />
				</main>
			</div>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
