"use client";
import { ConnectedAccounts } from "@fe/dashboard/components/connected-accounts";
import { PasswordChange } from "@fe/dashboard/components/password-change";
import { SessionManagement } from "@fe/dashboard/components/session-management";
import { authClient } from "@reloop/auth/client";
import { Skeleton } from "@reloop/ui/skeleton";
import useSWR from "swr";

interface Account {
	providerId: string;
}

const PasswordChangeSkeleton = () => (
	<div className="space-y-6">
		<div>
			<p className="font-semibold text-lg text-text-strong-950">
				Change Password
			</p>
			<p className="text-paragraph-sm text-text-sub-600">
				Update your password to keep your account secure
			</p>
		</div>
		<div className="space-y-4">
			<div>
				<Skeleton className="h-4 w-32 mb-2" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
			<div>
				<Skeleton className="h-4 w-28 mb-2" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
			<div>
				<Skeleton className="h-4 w-40 mb-2" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
			<div className="flex gap-4 pt-4">
				<Skeleton className="h-9 w-36 rounded-lg" />
				<Skeleton className="h-9 w-20 rounded-lg" />
			</div>
		</div>
	</div>
);

const SecurityPage = () => {
	const { data: accounts, isLoading } = useSWR<Account[]>(
		"security-accounts",
		async () => {
			const { data, error } = await authClient.listAccounts();
			if (error) {
				console.error("Failed to fetch accounts:", error);
				return [];
			}
			return data || [];
		},
		{
			revalidateOnFocus: false,
		}
	);

	const hasCredentialLogin = accounts?.some(
		(account) => account.providerId === "credential"
	) || false;

	return (
		<div className="w-full space-y-8 pt-5">
			<ConnectedAccounts />
			{isLoading ? (
				<PasswordChangeSkeleton />
			) : (
				hasCredentialLogin && <PasswordChange />
			)}
			<SessionManagement />
		</div>
	);
};

export default SecurityPage;
