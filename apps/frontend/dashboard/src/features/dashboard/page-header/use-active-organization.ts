import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrganizationsQuery } from "#/features/auth/organizations-query";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

export type Organization = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
};

/**
 * Session-backed active org for chrome (header switcher).
 * Syncs Better Auth session + durable user preference on first load.
 */
export function useActiveOrganization() {
	const queryClient = useQueryClient();
	const { data: session, isPending: sessionPending } = useSessionQuery();
	const userId = session?.user?.id ?? null;
	const {
		data: organizations,
		isPending: organizationsPending,
		refetch: refetchOrganizations,
	} = useOrganizationsQuery(!!userId);

	const [hasInitialized, setHasInitialized] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [confirmedSessionOrgId, setConfirmedSessionOrgId] = useState<
		string | null
	>(null);

	const sessionActiveOrganizationId =
		(
			session?.session as { activeOrganizationId?: string | null } | undefined
		)?.activeOrganizationId ?? null;
	const userActiveOrganizationId =
		(
			session?.user as { activeOrganizationId?: string | null } | undefined
		)?.activeOrganizationId ?? null;

	const effectiveSessionOrgId =
		sessionActiveOrganizationId ?? confirmedSessionOrgId;

	const resolvedActiveOrgId =
		effectiveSessionOrgId ??
		userActiveOrganizationId ??
		organizations?.[0]?.id ??
		null;

	const activeOrganization = useMemo(() => {
		if (!organizations?.length) return null;
		return (
			organizations.find((org) => org.id === resolvedActiveOrgId) ??
			organizations[0] ??
			null
		);
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

			if (
				sessionActiveOrganizationId === preferredOrgId &&
				userActiveOrganizationId === preferredOrgId
			) {
				setConfirmedSessionOrgId(preferredOrgId);
				setHasInitialized(true);
				return;
			}

			setIsSwitching(true);
			try {
				if (sessionActiveOrganizationId !== preferredOrgId) {
					await authClient.organization.setActive({
						organizationId: preferredOrgId,
					});
				}
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
		user: session?.user ?? null,
		organizations: organizations as Organization[] | undefined,
		activeOrganization: activeOrganization as Organization | null,
		sessionActiveOrganizationId: effectiveSessionOrgId,
		hasInitialized,
		isPending: sessionPending || organizationsPending || isSwitching,
		onOrganizationChange,
	};
}
