"use client";
import { ConnectedAccounts } from "@fe/dashboard/components/connected-accounts";
import { SessionManagement } from "@fe/dashboard/components/session-management";
const SecurityPage = () => {

	return (
		<div className="w-full space-y-8 pt-5">
			<ConnectedAccounts />
			<SessionManagement />
		</div>
	);
};

export default SecurityPage;
