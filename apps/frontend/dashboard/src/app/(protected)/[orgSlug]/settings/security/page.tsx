"use client";
import { ConnectedAccounts } from "@fe/dashboard/components/connected-accounts";
import { PasswordChange } from "@fe/dashboard/components/password-change";
import { SessionManagement } from "@fe/dashboard/components/session-management";
import { Icon } from "@reloop/ui/icon";

const SecurityPage = () => {
	return (
		<div>
			<div className="mb-5 border-stroke-soft-100 border-b p-5 pb-7">
				<div className="flex items-center gap-2">
					<Icon name="shield-check" className="h-5 w-5" />
					<p className="font-medium text-2xl text-text-strong-950">Security</p>
				</div>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your account security and active sessions
				</p>
			</div>
			<div className="w-full space-y-8 pt-5">
				<ConnectedAccounts />
				<PasswordChange />
				<SessionManagement />
			</div>
		</div>
	);
};

export default SecurityPage;

