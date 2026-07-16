import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "#/lib/query-keys";

interface Account {
	id: string;
	accountId: string;
	providerId: string;
	createdAt: Date;
}

interface ConnectedAccountsProps {
	className?: string;
}

const AVAILABLE_PROVIDERS = [
	{ id: "google", name: "Google", icon: "google", useCustomIcon: true },
	{ id: "github", name: "GitHub", icon: "github", useCustomIcon: false },
] as const;

const GoogleIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 16 15"
		aria-hidden
	>
		<path
			fill="#4280EF"
			d="M14.117 7.661c0-.456-.045-.926-.118-1.368H7.63v2.604h3.648a3.07 3.07 0 0 1-1.353 2.044l2.177 1.692c1.28-1.192 2.015-2.927 2.015-4.972"
		/>
		<path
			fill="#34A353"
			d="M7.63 14.252c1.824 0 3.354-.604 4.472-1.633l-2.177-1.677c-.603.412-1.383.647-2.295.647-1.765 0-3.25-1.191-3.794-2.78L1.6 10.53a6.74 6.74 0 0 0 6.03 3.722"
		/>
		<path
			fill="#F6B704"
			d="M3.836 8.794a4.1 4.1 0 0 1 0-2.588L1.6 4.47a6.76 6.76 0 0 0 0 6.06z"
		/>
		<path
			fill="#E54335"
			d="M7.63 3.426A3.68 3.68 0 0 1 10.22 4.44L12.146 2.5A6.5 6.5 0 0 0 7.63.749a6.74 6.74 0 0 0-6.03 3.72l2.236 1.736c.544-1.603 2.03-2.78 3.794-2.78"
		/>
	</svg>
);

const getProviderInfo = (providerId: string) => {
	switch (providerId.toLowerCase()) {
		case "google":
			return {
				name: "Google",
				icon: "google",
				useCustomIcon: true,
				description: "Connected via Google",
			};
		case "github":
			return {
				name: "GitHub",
				icon: "github",
				useCustomIcon: false,
				description: "Connected via GitHub",
			};
		case "credential":
			return {
				name: "Email and password",
				icon: "mail-single",
				useCustomIcon: false,
				description: "Connected via email and password",
			};
		default:
			return {
				name: providerId,
				icon: "user",
				useCustomIcon: false,
				description: `Connected via ${providerId}`,
			};
	}
};

const AccountSkeleton = () => (
	<div className="rounded-xl border border-stroke-soft-100 py-2 pr-2.5 pl-3 dark:border-stroke-soft-100/40">
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3 p-0.5">
				<Skeleton className="h-8 w-8 rounded-lg" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-32" />
				</div>
			</div>
			<Skeleton className="h-5 w-20 rounded-full" />
		</div>
	</div>
);

export function ConnectedAccounts({ className }: ConnectedAccountsProps) {
	const queryClient = useQueryClient();
	const [connecting, setConnecting] = useState<string | null>(null);
	const [disconnecting, setDisconnecting] = useState<string | null>(null);

	const { data: accounts, isPending: isLoading } = useQuery({
		queryKey: queryKeys.auth.accounts(),
		queryFn: async (): Promise<Account[]> => {
			const { data, error } = await authClient.listAccounts();
			if (error) {
				console.error("Failed to fetch accounts:", error);
				return [];
			}
			return (data as Account[]) || [];
		},
		refetchOnWindowFocus: false,
	});

	const invalidateAccounts = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts() });

	const handleConnect = async (provider: string) => {
		try {
			setConnecting(provider);
			await authClient.linkSocial({
				provider: provider as "github" | "google",
				callbackURL: window.location.href,
			});
		} catch (error) {
			console.error(`Failed to connect ${provider}:`, error);
		} finally {
			setConnecting(null);
		}
	};

	const handleDisconnect = async (providerId: string) => {
		try {
			setDisconnecting(providerId);
			const res = await authClient.unlinkAccount({ providerId });
			if (res.error) throw res.error;
			await invalidateAccounts();
		} catch (error) {
			console.error(`Failed to disconnect ${providerId}:`, error);
		} finally {
			setDisconnecting(null);
		}
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div>
				<p className="font-medium text-label-md text-text-strong-950">
					Connected Accounts
				</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage how you sign in to your workspace
				</p>
			</div>

			<div className="space-y-3">
				{isLoading ? (
					<>
						<AccountSkeleton />
						<AccountSkeleton />
						<AccountSkeleton />
					</>
				) : (
					<>
						{accounts?.map((account) => {
							const provider = getProviderInfo(account.providerId);
							return (
								<div
									key={account.id}
									className={cn(
										"rounded-[15px] border border-stroke-soft-100 py-2 pr-2.5 pl-3 dark:border-stroke-soft-100/40",
									)}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
												{provider.useCustomIcon &&
												account.providerId.toLowerCase() === "google" ? (
													<GoogleIcon className="h-4 w-4" />
												) : (
													<Icon
														name={provider.icon}
														className="h-4 w-4 text-text-sub-600"
													/>
												)}
											</div>
											<div>
												<p className="font-medium text-label-sm text-text-strong-950">
													{provider.name}
												</p>
												<p className="text-paragraph-xs text-text-sub-600">
													{provider.description}
												</p>
											</div>
										</div>
										{account.providerId !== "credential" ? (
											<Button.Root
												mode="stroke"
												variant="neutral"
												disabled={disconnecting === account.providerId}
												onClick={() => handleDisconnect(account.providerId)}
												className="h-8 px-3"
											>
												{disconnecting === account.providerId ? (
													<Spinner size={14} color="var(--text-strong-950)" />
												) : (
													<div className="flex items-center gap-1.5 text-text-sub-600">
														<Icon name="check" className="h-3.5 w-3.5" />
														<span className="font-medium text-xs">
															Disconnect
														</span>
													</div>
												)}
											</Button.Root>
										) : (
											<span className="rounded-full bg-success-base px-1.5 py-0.5 font-semibold text-[10px] text-white">
												Connected
											</span>
										)}
									</div>
								</div>
							);
						})}

						{AVAILABLE_PROVIDERS.filter(
							(p) => !accounts?.some((a) => a.providerId === p.id),
						).map((provider) => (
							<div
								key={provider.id}
								className="rounded-xl border border-stroke-soft-100 py-2 pr-2.5 pl-3 dark:border-stroke-soft-100/40"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
											{provider.useCustomIcon && provider.id === "google" ? (
												<GoogleIcon className="h-4 w-4" />
											) : (
												<Icon
													name={provider.icon}
													className="h-4 w-4 text-text-sub-600"
												/>
											)}
										</div>
										<div>
											<p className="font-medium text-label-sm text-text-strong-950">
												{provider.name}
											</p>
											<p className="text-paragraph-xs text-text-sub-600">
												Connect your {provider.name} account
											</p>
										</div>
									</div>
									<Button.Root
										mode="stroke"
										variant="neutral"
										disabled={connecting === provider.id}
										onClick={() => handleConnect(provider.id)}
										className="h-8"
									>
										{connecting === provider.id ? (
											<Spinner size={14} color="var(--text-strong-950)" />
										) : (
											<div className="flex items-center gap-1">
												<Icon name="plus" className="-ml-[3px] h-3.5 w-3.5" />
												<span className="font-medium text-xs">Connect</span>
											</div>
										)}
									</Button.Root>
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
}
