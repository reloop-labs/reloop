import { AdaptiveLayout } from "@fe/dashboard/components/layout/adaptive-layout";
import { CreateOrganizationModal } from "@fe/dashboard/components/organization/create-organization";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<AdaptiveLayout>
				{children}
				<CreateOrganizationModal />
				<Toaster />
			</AdaptiveLayout>
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
