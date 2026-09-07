import { isPlanId, type PlanId, pricingPlans } from "@reloop/pricing";

export function resolvePlanId(input: { id?: string; name?: string }): PlanId {
	if (input.id && isPlanId(input.id)) return input.id;
	const normalized = (input.name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}
