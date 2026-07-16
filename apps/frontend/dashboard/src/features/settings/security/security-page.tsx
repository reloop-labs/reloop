import { ConnectedAccounts } from "./connected-accounts";
import { SessionManagement } from "./session-management";

export function SecurityPage() {
	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
					Security
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
					Manage your account security, connected accounts, and active sessions.
				</p>
			</div>

			<ConnectedAccounts />
			<SessionManagement />
		</div>
	);
}
