import {
	ChatwootLoader,
	ChatwootUserSync,
} from "@fe/dashboard/components/chatwoot-widget";
import { UserOrganizationProvider } from "@fe/dashboard/providers/org-provider";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const TemplateEditorLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserOrganizationProvider>
			<div className="min-h-screen">{children}</div>
			<ChatwootLoader />
			<ChatwootUserSync />
		</UserOrganizationProvider>
	);
};

export default TemplateEditorLayout;
