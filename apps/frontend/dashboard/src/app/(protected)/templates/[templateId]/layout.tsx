import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";

const TemplateEditorLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="min-h-screen">{children}</div>
		</UserOrganizationProvider>
	);
};

export default TemplateEditorLayout;
