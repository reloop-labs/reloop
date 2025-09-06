import { Footer } from "@dashboard/components/footer";
import { Navbar } from "@dashboard/components/navbar";
import { UserOrganizationProvider } from "@dashboard/providers/org-provider";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<Navbar />
			{children}
			<Footer />
		</UserOrganizationProvider>
	);
};

export default OrgLayout;
