"use client";
import { ConnectedAccounts } from "./connected-accounts";
import { SessionManagement } from "./session-management";

const SecurityPage = () => {
	return (
		<div className="w-full space-y-6 pt-4">
			<ConnectedAccounts />
			<SessionManagement />
		</div>
	);
};

export default SecurityPage;
