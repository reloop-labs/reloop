/** An org with no plan row is treated as Free. */
export function isFreePlanId(planId: string | null | undefined): boolean {
	return !planId || planId === "free";
}

export type CreateOrganizationDecision = { ok: true } | { ok: false };

/**
 * A user may own at most one Free organization. Creating another org is
 * allowed only when every owned org is already on a paid plan.
 */
export function canCreateAnotherOrganization(
	ownedPlanIds: Array<string | null | undefined>,
): CreateOrganizationDecision {
	if (ownedPlanIds.some((planId) => isFreePlanId(planId))) {
		return { ok: false };
	}
	return { ok: true };
}

export function createOrganizationQuotaMessage(): string {
	return "Upgrade your free organization to a paid plan before creating another organization.";
}

export function memberRoleIncludesOwner(
	role: string | null | undefined,
): boolean {
	if (!role) return false;
	return role
		.split(",")
		.map((part) => part.trim())
		.includes("owner");
}
