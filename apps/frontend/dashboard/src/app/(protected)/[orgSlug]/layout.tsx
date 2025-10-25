import { AdaptiveLayout } from "@fe/dashboard/components/layout/adaptive-layout";
import { CreateOrganizationModal } from "@fe/dashboard/components/organization/create-organization";
import { LayoutProvider } from "@fe/dashboard/providers/layout-provider";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<LayoutProvider defaultMode="sidebar">
				<AdaptiveLayout>
					{children}
					<CreateOrganizationModal />
					<Toaster />
				</AdaptiveLayout>
			</LayoutProvider>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
