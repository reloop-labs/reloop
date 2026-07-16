import { authClient } from "@reloop/auth/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export function organizationsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.organizations(),
		queryFn: async () => {
			const { data, error } = await authClient.organization.list();
			if (error) {
				throw new Error(error.message || "Failed to list organizations");
			}
			return data ?? [];
		},
	});
}

export function userInvitationsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.userInvitations(),
		queryFn: async () => {
			const { data, error } =
				await authClient.organization.listUserInvitations();
			if (error) {
				throw new Error(error.message || "Failed to list invitations");
			}
			return data ?? [];
		},
	});
}

export function useOrganizationsQuery(enabled = true) {
	return useQuery({
		...organizationsQueryOptions(),
		enabled,
	});
}

export function useUserInvitationsQuery(enabled = true) {
	return useQuery({
		...userInvitationsQueryOptions(),
		enabled,
	});
}
