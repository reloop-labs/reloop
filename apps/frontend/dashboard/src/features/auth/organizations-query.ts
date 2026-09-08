import { authClient } from "@reloop/auth/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type OrganizationWithPlan = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	planId?: string;
};

type OrgPlanRow = {
	organizationId: string;
	planId: string;
};

export function mergeOrganizationsWithPlans<
	T extends { id: string; name: string; slug?: string; logo?: string | null },
>(organizations: T[], plans: OrgPlanRow[]): OrganizationWithPlan[] {
	const byOrg = new Map(plans.map((row) => [row.organizationId, row.planId]));
	return organizations.map((org) => ({
		id: org.id,
		name: org.name,
		slug: org.slug ?? "",
		logo: org.logo,
		planId: byOrg.get(org.id) ?? "free",
	}));
}

async function fetchOrgPlans(): Promise<OrgPlanRow[] | null> {
	try {
		const res = await fetch("/api/credits/v1/org-plans", {
			credentials: "include",
			cache: "no-store",
		});
		if (!res.ok) return null;
		const payload = (await res.json()) as { plans?: OrgPlanRow[] };
		if (!Array.isArray(payload.plans)) return null;
		return payload.plans;
	} catch {
		return null;
	}
}

export function organizationsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.organizations(),
		staleTime: 0,
		queryFn: async () => {
			if (typeof window === "undefined") {
				throw new Error(
					"organizationsQuery is browser-only (auth client has no absolute baseURL on SSR)",
				);
			}
			const [orgResult, plans] = await Promise.all([
				authClient.organization.list(),
				fetchOrgPlans(),
			]);
			if (orgResult.error) {
				throw new Error(
					orgResult.error.message || "Failed to list organizations",
				);
			}
			const organizations = orgResult.data ?? [];
			if (plans) {
				return mergeOrganizationsWithPlans(organizations, plans);
			}
			// Credits is down or unauthenticated — keep names, leave planId
			// unset so PlanBadge shows a placeholder instead of guessing Free.
			return organizations.map((org) => ({
				id: org.id,
				name: org.name,
				slug: org.slug,
				logo: org.logo,
			})) as OrganizationWithPlan[];
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
		refetchInterval: (query) => {
			const rows = query.state.data;
			if (!rows?.length) return false;
			return rows.some((org) => !org.planId) ? 2000 : false;
		},
	});
}

export function useUserInvitationsQuery(enabled = true) {
	return useQuery({
		...userInvitationsQueryOptions(),
		enabled: enabled && typeof window !== "undefined",
	});
}
