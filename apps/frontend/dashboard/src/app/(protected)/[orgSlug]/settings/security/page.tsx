"use client";
import { ConnectedAccounts } from "@fe/dashboard/components/connected-accounts";
import { PasswordChange } from "@fe/dashboard/components/password-change";
import { SessionManagement } from "@fe/dashboard/components/session-management";
import { authClient } from "@reloop/auth/client";
import { useEffect, useState } from "react";

const SecurityPage = () => {
	const [hasCredentialLogin, setHasCredentialLogin] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkLoginMethod = async () => {
			try {
				const { data } = await authClient.listAccounts();
				// Check if user has a credential (email/password) account
				const hasCredential = data?.some(
					(account) => account.providerId === "credential",
				);
				setHasCredentialLogin(hasCredential || false);
			} catch (error) {
				console.error("Failed to fetch accounts:", error);
				setHasCredentialLogin(false);
			} finally {
				setLoading(false);
			}
		};

		checkLoginMethod();
	}, []);

	return (
		<div className="w-full space-y-8 pt-5">
			<ConnectedAccounts />
			{!loading && hasCredentialLogin && <PasswordChange />}
			<SessionManagement />
		</div>
	);
};

export default SecurityPage;
