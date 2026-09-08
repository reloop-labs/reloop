import { isPlanId, type PlanId, pricingPlans } from "@reloop/pricing";
import type { PolarBillingPort, PolarProductRef } from "./polar";

const CACHE_TTL_MS = 5 * 60 * 1000;

export type PolarPlanCatalog = {
	fetchedAt: number;
	byPlanId: Partial<Record<PlanId, string>>;
	byProductId: Record<string, PlanId>;
	products: PolarProductRef[];
};

let cache: PolarPlanCatalog | null = null;

function metaString(
	metadata: Record<string, unknown> | null | undefined,
	key: string,
): string | undefined {
	const value = metadata?.[key];
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Map a Polar product to a Reloop plan.
 * Prefer Polar metadata `plan_id` (or `plan`); otherwise match product name
 * to Reloop plan id / display name (e.g. "Pro").
 */
export function matchReloopPlanId(product: {
	name?: string | null;
	metadata?: Record<string, unknown> | null;
}): PlanId | null {
	const fromMeta =
		metaString(product.metadata ?? undefined, "plan_id") ??
		metaString(product.metadata ?? undefined, "plan") ??
		metaString(product.metadata ?? undefined, "reloop_plan");
	if (fromMeta) {
		const normalized = fromMeta.trim().toLowerCase();
		if (isPlanId(normalized)) return normalized;
	}

	const name = product.name?.trim().toLowerCase();
	if (!name) return null;
	if (isPlanId(name)) return name;

	const byDisplayName = pricingPlans.find(
		(plan) => plan.name.toLowerCase() === name,
	);
	return byDisplayName?.id ?? null;
}

export function buildPolarPlanCatalog(
	products: PolarProductRef[],
	fetchedAt = Date.now(),
): PolarPlanCatalog {
	const byPlanId: Partial<Record<PlanId, string>> = {};
	const byProductId: Record<string, PlanId> = {};

	for (const product of products) {
		const planId = matchReloopPlanId(product);
		if (!planId) continue;
		byProductId[product.id] = planId;
		if (!byPlanId[planId]) byPlanId[planId] = product.id;
	}

	return { fetchedAt, byPlanId, byProductId, products };
}

export function invalidatePolarPlanCatalog(): void {
	cache = null;
}

export async function getPolarPlanCatalog(
	polar: PolarBillingPort,
	opts?: { force?: boolean },
): Promise<PolarPlanCatalog> {
	if (!opts?.force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
		return cache;
	}

	const products = await polar.listProducts();
	cache = buildPolarPlanCatalog(products);
	return cache;
}

export async function polarProductIdForPlan(
	planId: PlanId,
	polar: PolarBillingPort,
): Promise<string | null> {
	const catalog = await getPolarPlanCatalog(polar);
	return catalog.byPlanId[planId] ?? null;
}

export async function planIdFromPolarProduct(
	product: {
		id?: string;
		name?: string | null;
		metadata?: Record<string, unknown> | null;
	},
	polar?: PolarBillingPort,
): Promise<PlanId | null> {
	const fromPayload = matchReloopPlanId(product);
	if (fromPayload) return fromPayload;

	if (!product.id || !polar) return null;
	const catalog = await getPolarPlanCatalog(polar);
	return catalog.byProductId[product.id] ?? null;
}
