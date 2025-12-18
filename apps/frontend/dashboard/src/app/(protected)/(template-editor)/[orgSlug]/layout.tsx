import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";
import { Toaster } from "@reloop/ui/toast";

const TemplateEditorLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <UserOrganizationProvider>
            <div className="min-h-screen">
                {children}
                <Toaster />
            </div>
        </UserOrganizationProvider>
    );
};

export default TemplateEditorLayout;
