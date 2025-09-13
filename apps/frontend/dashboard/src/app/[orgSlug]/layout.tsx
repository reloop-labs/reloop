import { Footer } from "@dashboard/components/footer";
import { Navbar } from "@dashboard/components/navbar";
import { CreateOrganizationModal } from "@dashboard/components/organization/create-organization";
import { UserOrganizationProvider } from "@dashboard/providers/org-provider";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<Navbar />
			{children}
			<Footer />
			<CreateOrganizationModal />
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
