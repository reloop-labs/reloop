import { isPlanId, type PlanId, pricingPlans } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";

const PLAN_BADGE_CLASS: Record<PlanId, string> = {
	free: "bg-bg-weak-50 text-text-sub-600 ring-1 ring-stroke-soft-200 ring-inset",
	individual:
		"bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset]",
	startup:
		"bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset]",
	enterprise:
		"bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset]",
};

export function planLabel(planId: string | undefined): string {
	if (planId && isPlanId(planId)) {
		return pricingPlans.find((plan) => plan.id === planId)?.name ?? "Free";
	}
	return "Free";
}

export function PlanBadge({
	planId,
	compact = false,
}: {
	planId: string | undefined;
	compact?: boolean;
}) {
	const id: PlanId = planId && isPlanId(planId) ? planId : "free";
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded-full font-semibold uppercase tracking-wide",
				compact
					? "h-4 px-1.5 text-[9px] leading-none"
					: "h-[18px] px-2 text-[10px] leading-none",
				PLAN_BADGE_CLASS[id],
			)}
		>
			{planLabel(id)}
		</span>
	);
}
