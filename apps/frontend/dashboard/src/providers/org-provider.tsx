"use client";

import { authClient } from "@auth/client";
import Spinner from "@reloop/ui/components/spinner";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import useSWR from "swr";

type User = NonNullable<
	ReturnType<typeof authClient.useSession>["data"]
>["user"];
type Organization = NonNullable<
	Awaited<ReturnType<typeof authClient.organization.list>>["data"]
>[0];

type UserOrganizationContextType = {
	user: User;
	activeOrganization: Organization;
	push: (path: string, changeSlug?: boolean) => void;
};

// Create the context
const UserOrganizationContext =
	createContext<UserOrganizationContextType | null>(null);

export const useUserOrganization = (): UserOrganizationContextType => {
	const context = useContext(UserOrganizationContext);
	if (!context) {
		throw new Error(
			"useUserOrganization must be used within a UserOrganizationProvider",
		);
	}
	return context;
};

export const UserOrganizationProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const { orgSlug } = useParams();
	const { data: organizations, isLoading: organizationsLoading } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { push } = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isSettingDefaultOrg, setIsSettingDefaultOrg] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	const activeOrganization = organizations?.find(
		(organization) => organization.slug === orgSlug,
	);

	const isLoading =
		sessionLoading || organizationsLoading || isSettingDefaultOrg;

	useEffect(() => {
		const handleOrganizationRedirect = async () => {
			if (
				!sessionLoading &&
				!organizationsLoading &&
				organizations &&
				!isSettingDefaultOrg &&
				!hasInitialized
			) {
				// Ensure session is synced with user's activeOrganizationId
				if (session?.user?.activeOrganizationId) {
					console.log(
						"🔄 Ensuring session is synced with user activeOrganizationId:",
						session.user.activeOrganizationId,
					);
					try {
						await authClient.organization.setActive({
							organizationId: session.user.activeOrganizationId,
						});
					} catch (error) {
						console.error(
							"Failed to sync session with user activeOrganizationId:",
							error,
						);
					}
				}

				// Check if current URL slug matches session's active organization
				if (session?.user?.activeOrganizationId && orgSlug) {
					const sessionActiveOrg = organizations.find(
						(org) => org.id === session.user.activeOrganizationId,
					);

					// If session active org exists but slug doesn't match, redirect to correct slug
					if (sessionActiveOrg && sessionActiveOrg.slug !== orgSlug) {
						setIsSettingDefaultOrg(true);
						push(`/${sessionActiveOrg.slug}`);
						setIsSettingDefaultOrg(false);
						setHasInitialized(true);
						return;
					}
				}

				// Handle case where no active organization is found in URL
				if (!activeOrganization) {
					if (organizations.length > 0) {
						setIsSettingDefaultOrg(true);
						if (session?.user?.activeOrganizationId) {
							const targetOrg = organizations.find(
								(org) => org.id === session.user.activeOrganizationId,
							);
							if (targetOrg?.slug) {
								push(`/${targetOrg.slug}`);
								setIsSettingDefaultOrg(false);
								setHasInitialized(true);
								return;
							}
						}

						const firstOrg = organizations[0];
						if (firstOrg?.id && firstOrg?.slug) {
							try {
								await authClient.organization.setActive({
									organizationId: firstOrg.id,
								});
								await authClient.updateUser({
									activeOrganizationId: firstOrg.id,
								});
								push(`/${firstOrg.slug}`);
							} catch (error) {
								console.error("Failed to set default organization:", error);
							} finally {
								setIsSettingDefaultOrg(false);
								setHasInitialized(true);
							}
						} else {
							setIsSettingDefaultOrg(false);
							setHasInitialized(true);
						}
					}
				} else {
					setHasInitialized(true);
				}
			}
		};

		handleOrganizationRedirect();
	}, [
		sessionLoading,
		organizationsLoading,
		organizations,
		activeOrganization,
		isSettingDefaultOrg,
		hasInitialized,
		push,
		session?.user?.activeOrganizationId,
		orgSlug,
	]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!session?.user) {
		return <div>User not found</div>;
	}

	if (!activeOrganization) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	const onPush = (path: string, changeSlug?: boolean) => {
		if (changeSlug) {
			const pathWithoutOrg = pathname.replace(/^\/[^/]+/, "");
			const newPath = `/${path}${pathWithoutOrg}`;
			const queryString = searchParams.toString();
			push(queryString ? `${newPath}?${queryString}` : newPath);
			return;
		}
		push(`/${activeOrganization.slug}${path}`);
	};

	const contextValue: UserOrganizationContextType = {
		user: session.user,
		activeOrganization,
		push: onPush,
	};

	return (
		<UserOrganizationContext.Provider value={contextValue}>
			{children}
		</UserOrganizationContext.Provider>
	);
};
