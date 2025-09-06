"use client";

import { authClient } from "@reloop/auth/client";
import Spinner from "@reloop/ui/components/spinner";
import { useParams } from "next/navigation";
import { createContext, type ReactNode, useContext } from "react";
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

	const activeOrganization = organizations?.find(
		(organization) => organization.slug === orgSlug,
	);

	const isLoading = sessionLoading || organizationsLoading;

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
		return <div>Organization not found</div>;
	}

	const contextValue: UserOrganizationContextType = {
		user: session.user,
		activeOrganization,
	};

	return (
		<UserOrganizationContext.Provider value={contextValue}>
			{children}
		</UserOrganizationContext.Provider>
	);
};
