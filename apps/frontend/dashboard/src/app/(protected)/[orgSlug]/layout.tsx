import { AdaptiveLayout } from "@dashboard/components/layout/adaptive-layout";
import { CreateOrganizationModal } from "@dashboard/components/organization/create-organization";
import { LayoutProvider } from "@dashboard/providers/layout-provider";
import { UserOrganizationProvider } from "@dashboard/providers/org-provider";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<LayoutProvider defaultMode="sidebar">
				<AdaptiveLayout>
					{children}
					<CreateOrganizationModal />
				</AdaptiveLayout>
			</LayoutProvider>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
