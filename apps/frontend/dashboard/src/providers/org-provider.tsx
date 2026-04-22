"use client";

import { authClient } from "@reloop/auth/client";
import Spinner from "@reloop/ui/spinner";
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
	mutateOrganizations: () => void;
};

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
	const {
		data: organizations,
		isLoading: organizationsLoading,
		mutate: mutateOrganizations,
	} = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { push } = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isSettingDefaultOrg, setIsSettingDefaultOrg] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	const activeOrganization =
		organizations?.find(
			(organization) => organization.id === session?.user?.activeOrganizationId,
		) || organizations?.[0];

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
				if (session?.user?.activeOrganizationId) {
					try {
						await authClient.organization.setActive({
							organizationId: session.user.activeOrganizationId,
						});
					} catch (error) {
						console.log("Error setting active organization", { error });
					}
				}

				if (!activeOrganization) {
					if (organizations.length > 0) {
						setIsSettingDefaultOrg(true);

						const firstOrg = organizations[0];
						if (firstOrg?.id) {
							try {
								await authClient.organization.setActive({
									organizationId: firstOrg.id,
								});
								await authClient.updateUser({
									activeOrganizationId: firstOrg.id,
								});
							} catch (error) {
								console.log("Error setting active organization", { error });
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

	const onPush = (path: string, _changeSlug?: boolean) => {
		push(path);
	};

	const contextValue: UserOrganizationContextType = {
		user: session.user,
		activeOrganization,
		push: onPush,
		mutateOrganizations,
	};

	return (
		<UserOrganizationContext.Provider value={contextValue}>
			{children}
		</UserOrganizationContext.Provider>
	);
};
