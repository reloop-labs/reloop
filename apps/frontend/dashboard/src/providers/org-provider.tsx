"use client";

import { authClient } from "@reloop/auth/client";
import Spinner from "@reloop/ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
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
	user: User | null;
	activeOrganization: Organization | null;
	isLoading: boolean;
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
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const {
		data: organizations,
		isLoading: organizationsLoading,
		mutate: mutateOrganizations,
	} = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { data: invitations, isLoading: invitationsLoading } = useSWR(
		session ? "user-invitations" : null,
		async () => (await authClient.organization.listUserInvitations()).data,
	);
	const [isSettingDefaultOrg, setIsSettingDefaultOrg] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	const activeOrganization =
		organizations?.find(
			(organization) => organization.id === session?.user?.activeOrganizationId,
		) ||
		organizations?.[0] ||
		null;

	const isLoading =
		sessionLoading ||
		organizationsLoading ||
		(session && invitationsLoading) ||
		isSettingDefaultOrg;

	const hasRedirected = useRef(false);

	useEffect(() => {
		if (sessionLoading || hasRedirected.current) return;

		if (!session) {
			if (pathname.startsWith("/invite")) return;
			hasRedirected.current = true;
			router.push("/login");
			return;
		}

		if (
			!organizationsLoading &&
			organizations &&
			organizations.length === 0 &&
			!invitationsLoading
		) {
			if (pathname.startsWith("/invite") || pathname.startsWith("/onboarding"))
				return;

			if (invitations && invitations.length > 0 && invitations[0]) {
				hasRedirected.current = true;
				router.push(`/invite?id=${invitations[0].id}`);
				return;
			}

			hasRedirected.current = true;
			router.push("/onboarding");
			return;
		}
	}, [
		session,
		sessionLoading,
		organizations?.length,
		organizationsLoading,
		invitations,
		invitationsLoading,
		router,
		pathname,
	]);

	useEffect(() => {
		const handleOrganizationRedirect = async () => {
			if (
				!sessionLoading &&
				!organizationsLoading &&
				organizations &&
				!isSettingDefaultOrg &&
				!hasInitialized
			) {
				// If user already has an active org that exists in the list, just mark as initialized
				if (session?.user?.activeOrganizationId && activeOrganization) {
					setHasInitialized(true);
					return;
				}

				// No active org set — pick the first available one
				if (!activeOrganization && organizations.length > 0) {
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
				} else {
					setHasInitialized(true);
				}
			}
		};

		handleOrganizationRedirect();
	}, [
		sessionLoading,
		organizationsLoading,
		organizations?.length,
		activeOrganization?.id,
		isSettingDefaultOrg,
		hasInitialized,
		session?.user?.activeOrganizationId,
	]);

	const contextValue: UserOrganizationContextType = {
		user: session?.user ?? null,
		activeOrganization,
		isLoading,
		mutateOrganizations,
	};

	// Determine if we should show children or a loading state.
	// This prevents the dashboard from flashing before redirecting to onboarding.
	const shouldShowChildren = (() => {
		// Still loading data — don't render children yet
		if (sessionLoading || organizationsLoading) return false;
		// No session — will redirect to login
		if (!session) return false;
		// Has organizations with an active one — safe to render
		if (organizations && organizations.length > 0 && activeOrganization)
			return true;
		// No organizations — will redirect to onboarding (or invite)
		if (organizations && organizations.length === 0) return false;
		// Default: still resolving
		return false;
	})();

	return (
		<UserOrganizationContext.Provider value={contextValue}>
			{shouldShowChildren ? (
				children
			) : (
				<div className="flex h-screen w-full items-center justify-center">
					<Spinner size={24} />
				</div>
			)}
		</UserOrganizationContext.Provider>
	);
};
