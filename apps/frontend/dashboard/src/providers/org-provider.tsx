"use client";

import { Loader } from "@dot-loaders/react";
import { authClient } from "@reloop/auth/client";
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
import { isInvitationActionable } from "../utils/invitations";

type User = NonNullable<
	ReturnType<typeof authClient.useSession>["data"]
>["user"];
type Organization = NonNullable<
	Awaited<ReturnType<typeof authClient.organization.list>>["data"]
>[0];

type UserOrganizationContextType = {
	user: User | null;
	organizations: Organization[] | undefined;
	activeOrganization: Organization | null;
	isLoading: boolean;
	mutateOrganizations: () => void;
	onOrganizationChange: (organization: Organization) => Promise<void>;
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
	alwaysRender = false,
}: {
	children: ReactNode;
	alwaysRender?: boolean;
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const sessionLoading = sessionPending && session === undefined;
	const userId = session?.user?.id ?? null;
	const {
		data: organizations,
		isLoading: organizationsLoading,
		mutate: mutateOrganizations,
	} = useSWR(
		userId ? ["organizations", userId] : null,
		async () => (await authClient.organization.list()).data ?? [],
	);
	const { data: invitations, isLoading: invitationsLoading } = useSWR(
		userId ? ["user-invitations", userId] : null,
		async () =>
			(await authClient.organization.listUserInvitations()).data ?? [],
	);
	const [isSettingDefaultOrg, setIsSettingDefaultOrg] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	// Prefer Better Auth's session active org (what membership APIs use), then
	// the durable user preference, then the first membership as a last resort.
	const resolvedActiveOrgId =
		session?.session?.activeOrganizationId ??
		session?.user?.activeOrganizationId ??
		null;
	const activeOrganization =
		organizations?.find(
			(organization) => organization.id === resolvedActiveOrgId,
		) ||
		organizations?.[0] ||
		null;

	const isLoading =
		sessionLoading ||
		(!!userId && organizationsLoading) ||
		(!!userId && invitationsLoading) ||
		isSettingDefaultOrg;

	const hasRedirected = useRef(false);
	const lastRedirectUserId = useRef<string | null>(null);

	// Allow re-evaluation when the authenticated user changes (logout → signup).
	useEffect(() => {
		if (userId !== lastRedirectUserId.current) {
			hasRedirected.current = false;
			lastRedirectUserId.current = userId;
			setHasInitialized(false);
		}
	}, [userId]);

	useEffect(() => {
		if (session === undefined || hasRedirected.current || sessionPending)
			return;

		if (session === null) {
			if (pathname.startsWith("/invite")) return;
			hasRedirected.current = true;
			router.push("/login");
			return;
		}

		// Wait until membership + invite lists have settled for this user.
		if (organizationsLoading || invitationsLoading) return;
		// SWR finished: treat missing data as empty (network/null responses).
		const orgList = organizations ?? [];
		if (orgList.length > 0) return;

		if (pathname.startsWith("/invite") || pathname.startsWith("/onboarding"))
			return;

		// Only redirect for still-valid invites. Better Auth leaves expired
		// rows as status "pending", which used to trap users who could neither
		// accept the invite nor create their own organization.
		const actionableInvite = (invitations ?? []).find((invite) =>
			isInvitationActionable(invite),
		);
		if (actionableInvite) {
			hasRedirected.current = true;
			router.push(`/invite?id=${actionableInvite.id}`);
			return;
		}

		hasRedirected.current = true;
		router.push("/onboarding");
	}, [
		session,
		organizations,
		organizationsLoading,
		invitations,
		invitationsLoading,
		router,
		pathname,
		sessionPending,
	]);

	useEffect(() => {
		const syncActiveOrganization = async () => {
			if (
				sessionLoading ||
				organizationsLoading ||
				!organizations ||
				isSettingDefaultOrg ||
				hasInitialized
			) {
				return;
			}

			// Better Auth gates org membership APIs on session.activeOrganizationId.
			// user.activeOrganizationId is our durable "last used org" preference.
			const sessionActiveOrgId = session?.session?.activeOrganizationId ?? null;
			const userActiveOrgId = session?.user?.activeOrganizationId ?? null;

			const preferredOrgId =
				(sessionActiveOrgId &&
					organizations.find((org) => org.id === sessionActiveOrgId)?.id) ||
				(userActiveOrgId &&
					organizations.find((org) => org.id === userActiveOrgId)?.id) ||
				organizations[0]?.id ||
				null;

			if (!preferredOrgId) {
				setHasInitialized(true);
				return;
			}

			// Already aligned — nothing to do.
			if (
				sessionActiveOrgId === preferredOrgId &&
				userActiveOrgId === preferredOrgId
			) {
				setHasInitialized(true);
				return;
			}

			setIsSettingDefaultOrg(true);
			try {
				if (sessionActiveOrgId !== preferredOrgId) {
					await authClient.organization.setActive({
						organizationId: preferredOrgId,
					});
				}
				if (userActiveOrgId !== preferredOrgId) {
					await authClient.updateUser({
						activeOrganizationId: preferredOrgId,
					});
				}
			} catch (error) {
				console.log("Error setting active organization", { error });
			} finally {
				setIsSettingDefaultOrg(false);
				setHasInitialized(true);
			}
		};

		void syncActiveOrganization();
	}, [
		sessionLoading,
		organizationsLoading,
		organizations,
		isSettingDefaultOrg,
		hasInitialized,
		session?.session?.activeOrganizationId,
		session?.user?.activeOrganizationId,
	]);

	const onOrganizationChange = async (organization: Organization) => {
		try {
			await authClient.organization.setActive({
				organizationId: organization.id,
			});
			await authClient.updateUser({
				activeOrganizationId: organization.id,
			});
			mutateOrganizations();
		} catch (error) {
			console.error("Error switching organization", { error });
		}
	};

	const contextValue: UserOrganizationContextType = {
		user: session?.user ?? null,
		organizations: organizations ?? undefined,
		activeOrganization,
		isLoading,
		mutateOrganizations,
		onOrganizationChange,
	};

	// Determine if we should show children or a loading state.
	// This prevents the dashboard from flashing before redirecting to onboarding,
	// and waits until session/user active org are synced so org-gated pages work.
	const shouldShowChildren = (() => {
		// Still loading data or syncing active org — don't render children yet
		if (sessionLoading || organizationsLoading || isSettingDefaultOrg)
			return false;
		// No session — will redirect to login
		if (!session) return false;
		// Has organizations with an active one and sync finished — safe to render
		if (
			organizations &&
			organizations.length > 0 &&
			activeOrganization &&
			hasInitialized
		)
			return true;
		// No organizations — will redirect to onboarding (or invite)
		if (organizations && organizations.length === 0) return false;
		// Default: still resolving
		return false;
	})();

	return (
		<UserOrganizationContext.Provider value={contextValue}>
			{alwaysRender || shouldShowChildren ? (
				children
			) : (
				<div className="flex h-screen w-full items-center justify-center text-text-strong-950 dark:text-white">
					<Loader loader="pulse" />
				</div>
			)}
		</UserOrganizationContext.Provider>
	);
};
