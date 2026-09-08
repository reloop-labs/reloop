import { isPlanId, type PlanId, pricingPlans } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";

const KBD_BASE = "w-auto rounded-[5px] border font-semibold";

const PLAN_BADGE_CLASS: Record<PlanId, string> = {
	free: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	individual:
		"border-feature-light bg-feature-lighter text-feature-base shadow-[0_1.5px_0_0_var(--color-feature-light)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	startup:
		"border-warning-light bg-warning-lighter text-warning-base shadow-[0_1.5px_0_0_var(--color-warning-light)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	enterprise:
		"border-amber-200 bg-amber-50 text-amber-700 shadow-[0_1.5px_0_0_var(--color-amber-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
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
	const sizeClass = compact
		? "h-4 min-w-4 px-1 text-[9px] leading-none"
		: "h-[18px] min-w-4 px-1.5 text-[10px] leading-none";

	if (!planId || !isPlanId(planId)) {
		return (
			<span
				aria-hidden
				className={cn(
					"inline-flex shrink-0 animate-pulse rounded-[5px] bg-bg-weak-50",
					compact ? "h-4 w-10" : "h-[18px] w-14",
				)}
			/>
		);
	}

	const id: PlanId = planId;
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center font-semibold uppercase",
				KBD_BASE,
				sizeClass,
				PLAN_BADGE_CLASS[id],
			)}
		>
			{planLabel(id)}
		</span>
	);
}
