import { authClient } from "@reloop/auth/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export function organizationsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.organizations(),
		queryFn: async () => {
			if (typeof window === "undefined") {
				throw new Error(
					"organizationsQuery is browser-only (auth client has no absolute baseURL on SSR)",
				);
			}
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
			if (typeof window === "undefined") {
				throw new Error(
					"userInvitationsQuery is browser-only (auth client has no absolute baseURL on SSR)",
				);
			}
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
		enabled: enabled && typeof window !== "undefined",
	});
}

export function useUserInvitationsQuery(enabled = true) {
	return useQuery({
		...userInvitationsQueryOptions(),
		enabled: enabled && typeof window !== "undefined",
	});
}
