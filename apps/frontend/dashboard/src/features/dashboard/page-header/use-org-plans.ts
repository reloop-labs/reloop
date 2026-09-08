import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type OrgPlanRow = {
	organizationId: string;
	planId: string;
};

async function fetchOrgPlans(): Promise<OrgPlanRow[]> {
	const res = await fetch("/api/credits/v1/org-plans", {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error("Failed to load organization plans");
	}
	const payload = (await res.json()) as { plans?: OrgPlanRow[] };
	return payload.plans ?? [];
}

export function useOrgPlansQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.billing.orgPlans(),
		queryFn: fetchOrgPlans,
		enabled,
		staleTime: 60_000,
	});
}

export function orgPlanById(
	plans: OrgPlanRow[] | undefined,
): Record<string, string> {
	const byId: Record<string, string> = {};
	for (const row of plans ?? []) {
		byId[row.organizationId] = row.planId;
	}
	return byId;
}
