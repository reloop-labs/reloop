import { ConnectedAccounts } from "./connected-accounts";
import { SessionManagement } from "./session-management";

export function SecurityPage() {
	return (
		<div className="w-full space-y-6">
			<ConnectedAccounts />
			<SessionManagement />
		</div>
	);
}
