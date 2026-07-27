import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	createElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	useOrganizationsQuery,
	useUserInvitationsQuery,
} from "#/features/auth/organizations-query";
import { resolveOrglessDestination } from "#/features/auth/orgless-destination";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

export type Organization = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
};

export type ActiveOrganizationValue = {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		[key: string]: unknown;
	} | null;
	organizations: Organization[] | undefined;
	activeOrganization: Organization | null;
	/** Resolved org id as soon as session (or list) provides it — use for query gates. */
	activeOrganizationId: string | null;
	sessionActiveOrganizationId: string | null;
	hasInitialized: boolean;
	isPending: boolean;
	/**
	 * True when the signed-in user's workspace membership is settled enough for
	 * page content (org list loaded, active org initialized, not mid orgless redirect).
	 * False while resolving — layouts should keep chrome mounted and show a content skeleton.
	 */
	isMembershipReady: boolean;
	onOrganizationChange: (organization: Organization) => Promise<void>;
};

const ActiveOrganizationContext = createContext<ActiveOrganizationValue | null>(
	null,
);

function useActiveOrganizationState(): Omit<
	ActiveOrganizationValue,
	"isMembershipReady"
> {
	const queryClient = useQueryClient();
	const { data: session, isPending: sessionPending } = useSessionQuery();
	const userId = session?.user?.id ?? null;
	const {
		data: organizations,
		isPending: organizationsPending,
		refetch: refetchOrganizations,
	} = useOrganizationsQuery(!!userId);

	const [hasInitialized, setHasInitialized] = useState(false);
	/** True only while the user is switching orgs (or cold setActive when session has none). */
	const [isSwitching, setIsSwitching] = useState(false);
	const [confirmedSessionOrgId, setConfirmedSessionOrgId] = useState<
		string | null
	>(null);

	const sessionActiveOrganizationId =
		(session?.session as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ?? null;
	const userActiveOrganizationId =
		(session?.user as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ?? null;

	const effectiveSessionOrgId =
		sessionActiveOrganizationId ?? confirmedSessionOrgId;

	const resolvedActiveOrgId =
		effectiveSessionOrgId ??
		userActiveOrganizationId ??
		organizations?.[0]?.id ??
		null;

	/**
	 * Full org from the list when available. Before the list loads, expose a
	 * provisional stub so home cards can start fetches with the session org id.
	 */
	const activeOrganization = useMemo((): Organization | null => {
		if (organizations?.length) {
			return (
				(organizations.find((org) => org.id === resolvedActiveOrgId) as
					| Organization
					| undefined) ??
				(organizations[0] as Organization | undefined) ??
				null
			);
		}
		if (resolvedActiveOrgId) {
			return {
				id: resolvedActiveOrgId,
				name: "",
				slug: "",
			};
		}
		return null;
	}, [organizations, resolvedActiveOrgId]);

	// Re-sync when the authenticated user changes.
	useEffect(() => {
		setHasInitialized(false);
		setConfirmedSessionOrgId(null);
	}, [userId]);

	useEffect(() => {
		const syncActiveOrganization = async () => {
			if (
				sessionPending ||
				organizationsPending ||
				!organizations ||
				isSwitching ||
				hasInitialized
			) {
				return;
			}

			const preferredOrgId =
				(sessionActiveOrganizationId &&
					organizations.find((org) => org.id === sessionActiveOrganizationId)
						?.id) ||
				(userActiveOrganizationId &&
					organizations.find((org) => org.id === userActiveOrganizationId)
						?.id) ||
				organizations[0]?.id ||
				null;

			if (!preferredOrgId) {
				setHasInitialized(true);
				return;
			}

			// Happy path: session already points at the preferred org.
			// Do not block the UI on repairing the durable user preference.
			if (sessionActiveOrganizationId === preferredOrgId) {
				setConfirmedSessionOrgId(preferredOrgId);
				setHasInitialized(true);
				if (userActiveOrganizationId !== preferredOrgId) {
					void authClient
						.updateUser({ activeOrganizationId: preferredOrgId })
						.then(() =>
							queryClient.invalidateQueries({
								queryKey: queryKeys.auth.session(),
							}),
						)
						.catch((error) => {
							console.error("Error repairing user active organization", error);
						});
				}
				return;
			}

			// Session has no usable active org — must setActive before APIs that
			// rely on session org context. This path is uncommon after first login.
			setIsSwitching(true);
			try {
				await authClient.organization.setActive({
					organizationId: preferredOrgId,
				});
				if (userActiveOrganizationId !== preferredOrgId) {
					await authClient.updateUser({
						activeOrganizationId: preferredOrgId,
					});
				}
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.session(),
				});
				setConfirmedSessionOrgId(preferredOrgId);
			} catch (error) {
				console.error("Error setting active organization", error);
				if (sessionActiveOrganizationId === preferredOrgId) {
					setConfirmedSessionOrgId(preferredOrgId);
				}
			} finally {
				setIsSwitching(false);
				setHasInitialized(true);
			}
		};

		void syncActiveOrganization();
	}, [
		sessionPending,
		organizationsPending,
		organizations,
		isSwitching,
		hasInitialized,
		sessionActiveOrganizationId,
		userActiveOrganizationId,
		queryClient,
	]);

	const onOrganizationChange = useCallback(
		async (organization: Organization) => {
			setIsSwitching(true);
			try {
				await authClient.organization.setActive({
					organizationId: organization.id,
				});
				await authClient.updateUser({
					activeOrganizationId: organization.id,
				});
				setConfirmedSessionOrgId(organization.id);
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.session(),
				});
				await refetchOrganizations();
			} catch (error) {
				console.error("Error switching organization", error);
			} finally {
				setIsSwitching(false);
			}
		},
		[queryClient, refetchOrganizations],
	);

	return {
		user: (session?.user as ActiveOrganizationValue["user"]) ?? null,
		organizations: organizations as Organization[] | undefined,
		activeOrganization,
		activeOrganizationId: resolvedActiveOrgId,
		sessionActiveOrganizationId: effectiveSessionOrgId,
		hasInitialized,
		// Preference repair no longer sets isSwitching — only real setActive does.
		isPending: sessionPending || organizationsPending || isSwitching,
		onOrganizationChange,
	};
}

/**
 * Mount once under the authenticated dashboard layout.
 * All `useActiveOrganization()` consumers share this state (no multi-setActive races).
 *
 * Never swaps the tree for a full-screen loader — that caused a flash of dashboard
 * chrome (sidebar) then full-screen spinner on reload. Layouts keep the shell mounted
 * and gate page content on `isMembershipReady`.
 */
export function ActiveOrganizationProvider({
	children,
}: {
	children: ReactNode;
}) {
	const state = useActiveOrganizationState();
	const pathname = usePathname();
	const router = useRouter();
	const isOrgless = Boolean(
		state.user && state.organizations && state.organizations.length === 0,
	);
	const shouldCheckInvitations = isOrgless && pathname !== "/onboarding";
	const {
		data: invitations,
		isPending: invitationsPending,
		isFetched: invitationsFetched,
	} = useUserInvitationsQuery(shouldCheckInvitations);

	const orglessDestination = resolveOrglessDestination({
		pathname,
		organizations: state.organizations,
		invitations,
		invitationsSettled: invitationsFetched && !invitationsPending,
	});

	useEffect(() => {
		if (!orglessDestination) return;
		router.replace(orglessDestination);
	}, [router, orglessDestination]);

	// Mirror the previous full-screen gate, but as a flag for content-only skeletons.
	const isMembershipReady =
		pathname === "/onboarding" ||
		!state.user ||
		(state.organizations !== undefined &&
			state.organizations.length > 0 &&
			state.hasInitialized);

	const value: ActiveOrganizationValue = {
		...state,
		isMembershipReady,
	};

	return createElement(ActiveOrganizationContext.Provider, { value }, children);
}

/**
 * Session-backed active org for chrome and feature queries.
 * Must be used under `ActiveOrganizationProvider` (dashboard layout).
 */
export function useActiveOrganization(): ActiveOrganizationValue {
	const ctx = useContext(ActiveOrganizationContext);
	if (!ctx) {
		throw new Error(
			"useActiveOrganization must be used within ActiveOrganizationProvider",
		);
	}
	return ctx;
}
